"use client";

// ─────────────────────────────────────────────────────────────────────────────
// WaterSurface — 3D Gerstner wave ocean surface, visible from above.
//
// Key: analytic Gerstner normals computed per-vertex and Gouraud-interpolated.
// This eliminates the flat-shaded (polygonal) look that comes from using
// dFdx/dFdy screen-space derivatives, which are constant per triangle.
//
// Normal derivation for one Gerstner wave:
//   T_x += (−dx²·steep·sinF,  dx·steep·cosF, −dx·dz·steep·sinF)
//   T_z += (−dx·dz·steep·sinF, dz·steep·cosF, −dz²·steep·sinF)
//   N    = normalize(cross(T_z, T_x))   (gives +Y for flat plane)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WATER_VERT = /* glsl */`
uniform float uTime;
varying vec3  vWorldPos;
varying float vWaveH;
varying vec3  vNormal;   // analytic normal, interpolated smoothly between vertices

#define PI 3.14159265358979323846

// Gerstner displacement for one wave at current accumulated position.
vec3 gerstner(vec4 wave, vec3 pos) {
  float k = 2.0 * PI / wave.w;
  float c = sqrt(9.8 / k);
  vec2  d = normalize(wave.xz);
  float f = k * (dot(d, pos.xz) - c * uTime);
  float a = wave.y / k;
  return vec3(d.x * a * cos(f), a * sin(f), d.y * a * cos(f));
}

// Accumulate the tangent-vector contributions from one wave at current pos.
// steep = wave.y (= k·a), d = normalize(wave.xz).
void gerstnerNormal(vec4 wave, vec3 pos, inout vec3 T_x, inout vec3 T_z) {
  float k    = 2.0 * PI / wave.w;
  float c    = sqrt(9.8 / k);
  vec2  d    = normalize(wave.xz);
  float f    = k * (dot(d, pos.xz) - c * uTime);
  float steep = wave.y;
  float sf = sin(f), cf = cos(f);
  T_x += vec3(-d.x * d.x * steep * sf,  d.x * steep * cf, -d.x * d.y * steep * sf);
  T_z += vec3(-d.x * d.y * steep * sf,  d.y * steep * cf, -d.y * d.y * steep * sf);
}

void main() {
  // PlaneGeometry XY → world XZ. Negate Y so front face points up.
  vec3 pos = vec3(position.x, 0.0, -position.y);

  // Tangent accumulators start as identity (flat plane tangents)
  vec3 T_x = vec3(1.0, 0.0, 0.0);
  vec3 T_z = vec3(0.0, 0.0, 1.0);

  // 8 wave trains — compute normals BEFORE displacement so each wave samples
  // the correct (pre-displacement) position, matching the displacement loop.
  vec4 w1 = vec4( 0.97, 0.13,  0.26, 22.0);
  vec4 w2 = vec4( 0.55, 0.09, -0.84, 14.0);
  vec4 w3 = vec4(-0.46, 0.07,  0.89,  9.0);
  vec4 w4 = vec4( 0.18, 0.06, -0.98,  6.0);
  vec4 w5 = vec4( 0.84, 0.05,  0.54,  7.5);
  vec4 w6 = vec4(-0.68, 0.04, -0.73,  4.5);
  vec4 w7 = vec4( 0.08, 0.03,  1.00, 12.0);
  vec4 w8 = vec4(-0.99, 0.03,  0.14, 10.0);

  gerstnerNormal(w1, pos, T_x, T_z); pos += gerstner(w1, pos);
  gerstnerNormal(w2, pos, T_x, T_z); pos += gerstner(w2, pos);
  gerstnerNormal(w3, pos, T_x, T_z); pos += gerstner(w3, pos);
  gerstnerNormal(w4, pos, T_x, T_z); pos += gerstner(w4, pos);
  gerstnerNormal(w5, pos, T_x, T_z); pos += gerstner(w5, pos);
  gerstnerNormal(w6, pos, T_x, T_z); pos += gerstner(w6, pos);
  gerstnerNormal(w7, pos, T_x, T_z); pos += gerstner(w7, pos);
  gerstnerNormal(w8, pos, T_x, T_z); pos += gerstner(w8, pos);

  // cross(T_z, T_x) gives +Y normal for a flat plane
  vec3 N = normalize(cross(T_z, T_x));
  if (N.y < 0.0) N = -N;

  vWorldPos = pos;
  vWaveH    = pos.y;
  vNormal   = N;

  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

const WATER_FRAG = /* glsl */`
uniform vec3  uCameraPos;
uniform vec3  uSunDir;    // world-space sun direction, set from local time at page load
uniform float uTime;
varying vec3  vWorldPos;
varying float vWaveH;
varying vec3  vNormal;   // smooth analytic normal, Gouraud-interpolated from vertex shader

// Sunset sky palette for a world-space direction.
vec3 sunsetSky(vec3 dir) {
  float upY    = clamp(dir.y, 0.0, 1.0);
  vec3  zenith = vec3(0.07, 0.05, 0.20);
  vec3  mid    = vec3(0.38, 0.16, 0.40);
  vec3  horiz  = vec3(0.85, 0.40, 0.12);
  vec3  col    = mix(horiz, mid,    pow(upY, 0.38));
  col          = mix(col,   zenith, pow(upY, 1.30));
  vec3  sunDir = normalize(uSunDir);
  float sd     = max(0.0, dot(normalize(dir), sunDir));
  col += vec3(1.00, 0.88, 0.55) * pow(sd, 80.0) * 0.90;
  col += vec3(1.00, 0.60, 0.20) * pow(sd, 22.0) * 0.18;
  return col;
}

void main() {
  // Smooth analytic normal — no dFdx/dFdy, so no per-triangle faceting
  vec3 N = normalize(vNormal);
  if (N.y < 0.0) N = -N;

  vec3 V = normalize(uCameraPos - vWorldPos);

  // Fresnel (Schlick)
  float cosTheta = max(0.0, dot(N, V));
  float fresnel  = 0.02 + 0.72 * pow(1.0 - cosTheta, 5.0);

  // Reflected sky — capped to sunset orange-gold range
  vec3 R         = reflect(-V, N);
  vec3 reflColor = sunsetSky(R);
  reflColor      = min(reflColor, vec3(0.82, 0.55, 0.28));

  // Base deep water color
  vec3 deepWater = vec3(0.014, 0.038, 0.110);
  vec3 col       = mix(deepWater, reflColor, fresnel);

  // Specular — glitter path along sun direction
  vec3  sunL = normalize(uSunDir);
  vec3  rDir = reflect(-sunL, N);
  col += vec3(1.00, 0.72, 0.28) * pow(max(0.0, dot(rDir, V)), 40.0) * 0.28;

  // Foam at wave crests
  float foam = pow(max(0.0, vWaveH * 0.5 + 0.08), 3.5) * 0.55;
  col = mix(col, vec3(0.95, 0.80, 0.60), foam);

  // Depth shading: troughs slightly darker
  col *= 0.78 + 0.22 * clamp(vWaveH * 0.5 + 0.65, 0.0, 1.0);

  // Mild Reinhard — prevents over-bright pixels triggering excessive Bloom
  col = col / (col + vec3(0.75));
  col *= 1.75;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function WaterSurface() {
  const meshRef = useRef<THREE.Mesh>(null);

  const mat = useMemo(() => {
    // Compute sun direction from local time (mirrors WaterEffects.tsx)
    const now     = new Date();
    const hour    = now.getHours() + now.getMinutes() / 60;
    const SUNRISE = 6.0, SUNSET = 20.0;
    const isDaytime = hour >= SUNRISE && hour <= SUNSET;
    const t    = Math.max(0, Math.min(1, (hour - SUNRISE) / (SUNSET - SUNRISE)));
    const el   = isDaytime ? Math.sin(t * Math.PI) : 0;
    const sunX = isDaytime ? (t - 0.5) * 1.4 : 0.35;
    const sunY = el > 0 ? Math.max(0.22, el * 0.75) : 0.22;
    const sunDir = new THREE.Vector3(sunX, sunY, -1).normalize();

    return new THREE.ShaderMaterial({
      vertexShader:   WATER_VERT,
      fragmentShader: WATER_FRAG,
      uniforms: {
        uTime:      { value: 0 },
        uCameraPos: { value: new THREE.Vector3() },
        uSunDir:    { value: sunDir },
      },
      side: THREE.FrontSide,
    });
  }, []);

  useFrame(({ clock, camera }) => {
    mat.uniforms.uTime.value      = clock.elapsedTime;
    mat.uniforms.uCameraPos.value.copy(camera.position);
    if (meshRef.current) {
      meshRef.current.visible = camera.position.y > -0.8;
    }
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[200, 200, 256, 256]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}
