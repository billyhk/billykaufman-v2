"use client";

// ─────────────────────────────────────────────────────────────────────────────
// WaterEffects — unified above/below water shader
//
// Above water (uCamY > 0):
//   Sky gradient with sun + haze, water surface with Gerstner-derived normals,
//   Fresnel reflection of sky, specular highlight, foam at wave crests.
//   Horizon naturally at screen center since camera looks horizontally.
//
// Below water (uCamY < 0):
//   Physically-based caustic network (Evan Wallace method: refract → floor UV
//   → 1/Jacobian), god rays, Snell's window, click ripples.
//
// Transition zone (−0.5 < uCamY < 0.5): crossfade.
// Click anywhere → ripple that reads correctly in both modes.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv         = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0); // NDC bypass — always fullscreen
}
`;

const FRAG = /* glsl */`
uniform float uTime;
uniform float uCamY;      // camera world Y (positive = above water, negative = below)
uniform vec2  uPointer;   // cursor UV [0,1]
uniform vec2  uRipplePos; // last-click UV
uniform float uRippleAge; // seconds since click
uniform vec2  uSunUV;     // sun screen-space UV, projected each frame from 3D sun direction
uniform float uAspect;    // viewport width / height — used to draw a circular (not oval) sun
// Sky palette — computed from local time of day at page load
uniform vec3  uZenith;
uniform vec3  uMidSky;
uniform vec3  uHorizon;
uniform vec3  uHaze;
uniform float uSunVisible; // 0 at night (no sun disc), 1 during daylight

varying vec2 vUv;

// ══════════════════════════════════════════════════════════════════════════════
// SHARED: wave height field used by both above and below shaders
// ══════════════════════════════════════════════════════════════════════════════

float waveH(vec2 p, float t) {
  // 6 crossing wave trains — p is already in "world" UV×scale space
  return sin(dot(p, vec2( 0.88,  0.20)) *  4.0 + t * 1.10) * 0.40
       + sin(dot(p, vec2(-0.48,  0.68)) *  6.0 - t * 1.35) * 0.26
       + sin(dot(p, vec2( 0.30, -0.80)) *  9.5 + t * 1.65) * 0.16
       + sin(dot(p, vec2(-0.72,  0.38)) * 13.0 - t * 2.00) * 0.10
       + sin(dot(p, vec2( 0.62,  0.58)) * 19.0 + t * 2.50) * 0.06
       + sin(dot(p, vec2( 0.12, -0.92)) * 27.0 - t * 3.20) * 0.03;
}

float rippleH(vec2 uv) {
  if (uRippleAge > 6.0) return 0.0;
  float d = length(uv - uRipplePos);
  return cos(d * 22.0 - uRippleAge * 7.0)
       * exp(-d * 3.5) * exp(-uRippleAge * 0.9) * 0.55;
}

float hoverH(vec2 uv) {
  float d = length((uv - uPointer) * vec2(2.0, 1.0));
  return exp(-d * d * 35.0) * sin(d * 28.0) * 0.07;
}

float totalH(vec2 uv, float t) {
  return waveH(uv * 5.0, t) + rippleH(uv) + hoverH(uv);
}

// ══════════════════════════════════════════════════════════════════════════════
// ABOVE WATER
// ══════════════════════════════════════════════════════════════════════════════

// Above-water: sky background. Colors driven by uZenith/uMidSky/uHorizon/uHaze
// which are computed from local time of day in JS at page load.
vec3 aboveWater(vec2 uv, float t) {
  // Sky gradient
  float skyT = clamp(uv.y / 1.0, 0.0, 1.0);
  vec3 col   = mix(uHorizon, uMidSky, pow(skyT, 0.38));
  col        = mix(col,      uZenith, pow(skyT, 1.30));

  // Sun disc — use the fully projected screen UV (X and Y), not a hardcoded horizon pin.
  // uSunUV is computed each frame by projecting the 3D sun direction to clip space.
  vec2  sunPos  = uSunUV;
  vec2  sunDiff = uv - sunPos;
  sunDiff.x    *= uAspect;   // aspect-correct so disc is circular, not oval
  float sunD    = length(sunDiff);
  col += uHaze                   * exp(-sunD * sunD *  65.0) * 0.28 * uSunVisible;
  col += vec3(1.00, 0.97, 0.82) * exp(-sunD * sunD * 350.0) * 0.90 * uSunVisible;
  col += uHaze                   * exp(-sunD * sunD *  90.0) * 0.30 * uSunVisible;

  // Horizon warm band
  float h = exp(-pow(uv.y * 12.0, 1.2));
  col = mix(col, uHaze, h * 0.38);

  // Thin horizon glow — centred at the sun's projected Y so it tracks the actual horizon
  float horizonGlow = exp(-pow((uv.y - uSunUV.y) * 18.0, 2.0));
  col += uHorizon * 0.85 * horizonGlow * 0.30;

  // Dark ocean band at bottom
  float oceanBand = 1.0 - smoothstep(0.0, 0.22, uv.y);
  col = mix(col, vec3(0.020, 0.055, 0.140), oceanBand * 0.80);

  return col;
}

// ══════════════════════════════════════════════════════════════════════════════
// BELOW WATER — physically-based caustics (Evan Wallace method)
// ══════════════════════════════════════════════════════════════════════════════

vec3 surfNormal(vec2 uv, float t) {
  const float e = 0.006;
  float h0 = totalH(uv, t);
  float hx = totalH(uv + vec2(e, 0.0), t);
  float hy = totalH(uv + vec2(0.0, e), t);
  return normalize(vec3(-(hx - h0) / e * 0.28, 1.0, -(hy - h0) / e * 0.28));
}

vec2 floorUV(vec2 uv, float t) {
  vec3 N = surfNormal(uv, t);
  vec3 I = vec3(0.0, -1.0, 0.0);
  vec3 R = refract(I, N, 1.0 / 1.333);
  return uv + R.xz / max(abs(R.y), 0.01) * 0.38;
}

float caustic(vec2 uv, float t) {
  const float e = 0.010;
  vec2 f00 = floorUV(uv,               t);
  vec2 f10 = floorUV(uv + vec2(e, 0.0), t);
  vec2 f01 = floorUV(uv + vec2(0.0, e), t);
  vec2 du = (f10 - f00) / e;
  vec2 dv = (f01 - f00) / e;
  float area = abs(du.x * dv.y - du.y * dv.x);
  return clamp(0.55 / max(area, 0.14), 0.0, 3.5);
}

vec3 belowWater(vec2 uv, float t) {
  // ── Dark ocean base — progressively darker with depth ─────────────────────
  // camY=-2 (just below surface) → light blue; camY=-62 (abyss) → near black
  float depthT = clamp((-uCamY - 2.0) / 55.0, 0.0, 1.0);
  vec3 col = mix(vec3(0.006, 0.028, 0.072), vec3(0.001, 0.003, 0.008), depthT);
  col += vec3(0.002, 0.010, 0.022) * (uv.y * uv.y);

  float surfH  = 0.78;
  float depth  = max(0.0, surfH - uv.y);

  // God rays fade out as the camera descends into the twilight zone.
  // Sunlight zone ends at camY ≈ -12.8; fully gone by camY = -18.
  float rayFade = 1.0 - clamp((-uCamY - 5.0) / 13.0, 0.0, 1.0);

  // Snell's window focal point — X tracks the sun, Y pushed above viewport so
  // the convergence point is never visible (only the fanning rays below it are).
  vec2  snellPos = vec2(uSunUV.x + 0.020 * sin(t * 0.28), 1.18);

  // Light cone — wide shaft descending from Snell's window
  float coneAxis  = uv.x - snellPos.x;
  float coneHalfW = 0.14 + depth * 1.10;
  float cone = exp(-(coneAxis * coneAxis) / max(0.0001, coneHalfW * coneHalfW))
             * exp(-depth * 1.80);
  col += vec3(0.045, 0.140, 0.310) * cone * rayFade;

  // God rays — volumetric beams fanning out from Snell's window
  vec2  toSnell  = uv - snellPos;
  float rayAngle = atan(toSnell.x, -toSnell.y);

  // Primary rays: tighter, brighter beams
  float rayPat = pow(max(0.0,
    sin(rayAngle * 4.5 + t * 0.18)
  * sin(rayAngle * 7.5 - t * 0.14 + 1.30)
  ), 2.0);
  col += vec3(0.055, 0.170, 0.370) * rayPat * cone
       * exp(-depth * 2.5) * (1.0 - step(snellPos.y, uv.y)) * rayFade;

  // Secondary rays: broader, slower — give sense of multiple overlapping shafts
  float rayPat2 = pow(max(0.0,
    sin(rayAngle * 2.8 - t * 0.12 + 0.7)
  * sin(rayAngle * 5.3 + t * 0.19)
  ), 2.5);
  col += vec3(0.025, 0.080, 0.180) * rayPat2 * cone
       * exp(-depth * 2.0) * (1.0 - step(snellPos.y, uv.y)) * rayFade;

  return col;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

void main() {
  vec2  uv = vUv;
  float t  = uTime * 0.45;

  vec3 above = aboveWater(uv, t);
  vec3 below = belowWater(uv, t);

  // Crossfade: above water [+0.5, +inf] → below water [-inf, -0.5]
  float underwaterT = smoothstep(0.5, -0.5, uCamY);
  vec3  col         = mix(above, below, underwaterT);

  gl_FragColor = vec4(col, 1.0);
}
`;

// ── Sky palette from local time of day ────────────────────────────────────────
// Realistic spring/summer window (e.g. New York): sunrise 6 AM, sunset 8 PM.
// Returns colors and sun direction computed once at page load.
function computeSkyFromTime() {
  const now     = new Date();
  const hour    = now.getHours() + now.getMinutes() / 60;
  const SUNRISE = 6.0;
  const SUNSET  = 20.0; // 8 PM — sun visible until then
  const isDaytime = hour >= SUNRISE && hour <= SUNSET;

  // t: 0 at sunrise, 1 at sunset — elevation peaks (1.0) at solar noon
  const t         = Math.max(0, Math.min(1, (hour - SUNRISE) / (SUNSET - SUNRISE)));
  const elevation = isDaytime ? Math.sin(t * Math.PI) : -1;
  // Golden→Day blend: threshold 0.7 keeps golden palette through golden hour;
  // sky only turns full blue when the sun is well overhead (elevation ≥ 0.7)
  const dayBlend  = isDaytime ? Math.min(1, elevation / 0.7) : 0;

  // Three palette extremes
  const GOLDEN = {
    zenith:  new THREE.Color(0.07, 0.05, 0.20),
    midSky:  new THREE.Color(0.40, 0.18, 0.44),
    horizon: new THREE.Color(0.96, 0.50, 0.14),
    haze:    new THREE.Color(1.00, 0.68, 0.40),
  };
  const DAY = {
    zenith:  new THREE.Color(0.08, 0.28, 0.74),
    midSky:  new THREE.Color(0.26, 0.52, 0.88),
    horizon: new THREE.Color(0.62, 0.81, 0.96),
    haze:    new THREE.Color(0.88, 0.94, 1.00),
  };
  const NIGHT = {
    zenith:  new THREE.Color(0.010, 0.012, 0.055),
    midSky:  new THREE.Color(0.018, 0.020, 0.090),
    horizon: new THREE.Color(0.030, 0.025, 0.110),
    haze:    new THREE.Color(0.050, 0.040, 0.155),
  };

  const lerp = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, Math.max(0, Math.min(1, t)));

  let zenith, midSky, horizon, haze, sunVisible: number;
  if (!isDaytime) {
    // Night: dark palette, slightly warmed toward golden at the horizon
    zenith  = lerp(GOLDEN.zenith,  NIGHT.zenith,  0.75);
    midSky  = lerp(GOLDEN.midSky,  NIGHT.midSky,  0.75);
    horizon = lerp(GOLDEN.horizon, NIGHT.horizon, 0.70);
    haze    = lerp(GOLDEN.haze,    NIGHT.haze,    0.70);
    sunVisible = 0;
  } else {
    // Daytime: blend golden hour ↔ bright blue sky based on sun elevation
    zenith  = lerp(GOLDEN.zenith,  DAY.zenith,  dayBlend);
    midSky  = lerp(GOLDEN.midSky,  DAY.midSky,  dayBlend);
    horizon = lerp(GOLDEN.horizon, DAY.horizon, dayBlend);
    haze    = lerp(GOLDEN.haze,    DAY.haze,    dayBlend);
    // Smooth 45-min fade at dawn and dusk edges so the disc doesn't hard-pop
    sunVisible = Math.max(0, Math.min(1, Math.min(hour - SUNRISE, SUNSET - hour) / 0.75));
  }

  // Sun world-space direction: east (left, negative X) at dawn → west (right) at dusk
  const sunX   = isDaytime ? (t - 0.5) * 1.4 : 0.35;
  const sunY   = isDaytime ? Math.max(0.22, elevation * 0.75) : 0.22;
  const sunDir = new THREE.Vector3(sunX, sunY, -1).normalize();

  return { zenith, midSky, horizon, haze, sunVisible, sunDir };
}

export default function WaterEffects() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  // Cached scratch vector — avoids per-frame allocation
  const _sunPt = useMemo(() => new THREE.Vector3(), []);

  const { mat, sunDir } = useMemo(() => {
    const sky = computeSkyFromTime();
    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:       { value: 0 },
        uCamY:       { value: 6 },
        uPointer:    { value: new THREE.Vector2(0.5, 0.5) },
        uRipplePos:  { value: new THREE.Vector2(0.5, 0.5) },
        uRippleAge:  { value: 9999 },
        uSunUV:      { value: new THREE.Vector2(0.65, 0.18) },
        uAspect:     { value: 16 / 9 },
        uZenith:     { value: sky.zenith },
        uMidSky:     { value: sky.midSky },
        uHorizon:    { value: sky.horizon },
        uHaze:       { value: sky.haze },
        uSunVisible: { value: sky.sunVisible },
      },
      transparent: false,
      depthTest:   false,
      depthWrite:  false,
    });
    return { mat, sunDir: sky.sunDir };
  }, []);

  // Pointer + click ripple interaction
  useEffect(() => {
    const canvas = gl.domElement;
    const toUV = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        (cx - r.left) / r.width,
        1.0 - (cy - r.top) / r.height,
      );
    };
    const onMove = (e: PointerEvent) => {
      mat.uniforms.uPointer.value.copy(toUV(e.clientX, e.clientY));
    };
    const onClick = (e: MouseEvent) => {
      mat.uniforms.uRipplePos.value.copy(toUV(e.clientX, e.clientY));
      mat.uniforms.uRippleAge.value = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, [gl, mat]);

  useFrame(({ clock, camera, size }, delta) => {
    mat.uniforms.uTime.value   = clock.elapsedTime;
    mat.uniforms.uCamY.value   = camera.position.y;
    mat.uniforms.uAspect.value = size.width / size.height;
    if (mat.uniforms.uRippleAge.value < 9999) {
      mat.uniforms.uRippleAge.value += delta;
    }
    // Project 3D sun direction → screen UV (only X is used; Y is pinned to horizon in shader)
    _sunPt.copy(camera.position).addScaledVector(sunDir, 100);
    _sunPt.project(camera);
    mat.uniforms.uSunUV.value.set(_sunPt.x * 0.5 + 0.5, _sunPt.y * 0.5 + 0.5);
  });

  return (
    <mesh ref={meshRef} renderOrder={-100}>
      <planeGeometry args={[2, 2]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}
