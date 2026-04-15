"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import HeroElements from "./HeroElements";
import DeepCreatures from "./DeepCreatures";
import WaterEffects from "./WaterEffects";
import WaterSurface from "./WaterSurface";
import WaterEntryEffect from "./WaterEntryEffect";
import SkyElements from "./SkyElements";
import { useScenePhase } from "@/context/ScenePhaseContext";

// Camera starts ABOVE_WATER_Y above the surface and descends SCROLL_DEPTH_SCALE below it.
// Total camera travel = ABOVE_WATER_Y + SCROLL_DEPTH_SCALE.
const ABOVE_WATER_Y    = 5;   // higher vantage point — room for birds and island on horizon
const SCROLL_DEPTH_SCALE = 60;
const TOTAL_CAM_TRAVEL = ABOVE_WATER_Y + SCROLL_DEPTH_SCALE; // 65

// Dive animation — triggered when visitor clicks "Dive In".
const DIVE_DURATION = 2.5;  // seconds
const DIVE_END_Y    = -2.0; // camera Y when animation finishes

// Depth color stops mapped to scrollProgress 0→1.
// Index 0 = above water (sunset sky), remaining = ocean depths.
const DEPTH_COLORS = [
  new THREE.Color("#1a0830"), // 0.0 - sunset sky (indigo/purple zenith)
  new THREE.Color("#0d2952"), // 0.1 - just below surface
  new THREE.Color("#0a3358"), // 0.2 - shallow
  new THREE.Color("#05172c"), // 0.5 - mid water
  new THREE.Color("#030e1e"), // 0.7 - deep
  new THREE.Color("#010810"), // 0.9 - abyss
  new THREE.Color("#000408"), // 1.0 - void
];

function lerpColor(t: number): THREE.Color {
  const scaled = t * (DEPTH_COLORS.length - 1);
  const i = Math.min(Math.floor(scaled), DEPTH_COLORS.length - 2);
  const f = scaled - i;
  return DEPTH_COLORS[i].clone().lerp(DEPTH_COLORS[i + 1], f);
}

// ── Bubbles — iridescent glass shader ─────────────────────────────────────────
const BUBBLE_VERT = /* glsl */`
  attribute float aRandom;
  varying float vRandom;
  void main() {
    vRandom = aRandom;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Perspective size attenuation — manual because ShaderMaterial skips PointsMaterial's version
    gl_PointSize = max(1.5, 11.0 * (1.0 / -mvPosition.z));
    gl_Position  = projectionMatrix * mvPosition;
  }
`;

const BUBBLE_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uDepthFade; // 1 near surface, 0 deep — fades bubbles out in the twilight zone
  varying float vRandom;
  void main() {
    if (uDepthFade <= 0.0) discard;

    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft circle with a clean edge
    float alpha = 1.0 - smoothstep(0.33, 0.5, dist);
    // rim factor: 0 at centre, 1 at edge
    float rim   = smoothstep(0.0, 0.42, dist);

    // Thin-film iridescence: hue cycles with rim angle + per-bubble random + time
    float hue = vRandom * 6.28318 + uTime * 0.13 + rim * 4.2;
    vec3 iridescent = vec3(
      0.5 + 0.5 * sin(hue),
      0.5 + 0.5 * sin(hue + 2.09440),  // +120°
      0.5 + 0.5 * sin(hue + 4.18879)   // +240°
    );

    // Cool blue-white core blends to iridescent rim
    vec3 core  = vec3(0.55, 0.84, 1.0);
    vec3 color = mix(core * 0.28, iridescent, rim);

    gl_FragColor = vec4(color, alpha * 0.38 * uDepthFade);
  }
`;

function Bubbles({ count = 1800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const randoms   = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i]  = 0.005 + Math.random() * 0.015;
      randoms[i] = Math.random();
    }
    return { positions, speeds, randoms };
  }, [count]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   BUBBLE_VERT,
    fragmentShader: BUBBLE_FRAG,
    uniforms: { uTime: { value: 0 }, uDepthFade: { value: 1 } },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), []);

  useFrame(({ clock, camera }) => {
    if (!ref.current) return;
    // Bubbles only near the surface — fade out through the sunlight zone, gone by twilight
    // camY: 0 = surface, -3 = fade starts, -14 = fully gone
    const depthFade = Math.max(0, Math.min(1, (-camera.position.y - 3) / 11));
    mat.uniforms.uDepthFade.value = 1 - depthFade;
    ref.current.visible = camera.position.y < 0 && depthFade < 1;
    if (!ref.current.visible) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 40) pos[i * 3 + 1] = -40;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandom"  args={[randoms, 1]} />
      </bufferGeometry>
      <primitive object={mat} attach="material" />
    </points>
  );
}

// ── Bioluminescent specks ─────────────────────────────────────────────────────
function BioParticles({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = -20 - Math.random() * 60;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.2 + Math.sin(clock.elapsedTime * 0.8) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#4ade80" transparent opacity={0.25} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ── Main scene ────────────────────────────────────────────────────────────────
export default function OceanScene() {
  const { camera, gl } = useThree();
  const { phase, phaseRef, diveEndCamYRef, scrollReadyRef, markUnderwater } = useScenePhase();

  // Dive animation state
  const diveTimer    = useRef(0);
  const diveDone     = useRef(false);

  // Measure the projects section so we can freeze the camera while scrolling through it.
  // That section's scroll drives the project list only — not ocean depth.
  const projectsRange = useRef<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const el = document.getElementById("projects");
      if (!el) return;
      projectsRange.current = {
        top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        height: el.offsetHeight,
      };
    };
    const t = setTimeout(measure, 120); // after layout settles
    window.addEventListener("resize", measure, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, []);

  // Returns a scroll progress value with the projects section's scroll range subtracted.
  // Camera and background color freeze at the entry depth while inside that section.
  const getAdjustedProgress = () => {
    const docEl = document.documentElement;
    const scrollTop = docEl.scrollTop;
    const totalRange = docEl.scrollHeight - docEl.clientHeight;
    if (totalRange === 0) return 0;
    const pr = projectsRange.current;
    if (!pr) return Math.min(scrollTop / totalRange, 1);
    const projEnd = pr.top + pr.height;
    let eff: number;
    if (scrollTop <= pr.top) {
      eff = scrollTop;
    } else if (scrollTop >= projEnd) {
      eff = pr.top + (scrollTop - projEnd);
    } else {
      eff = pr.top; // frozen — inside projects section
    }
    return Math.min(eff / Math.max(totalRange - pr.height, 1), 1);
  };

  const [scrollProgress, setScrollProgress] = useState(getAdjustedProgress);
  const targetCamY  = useRef(ABOVE_WATER_Y - getAdjustedProgress() * TOTAL_CAM_TRAVEL);
  const currentCamY = useRef(ABOVE_WATER_Y - getAdjustedProgress() * TOTAL_CAM_TRAVEL);

  // Minimum scrollTop that keeps the camera at or below Y=0 (the water surface).
  // Set once after the dive completes and content renders. Enforced in onScroll.
  const minScrollTopRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;

      // Clamp: never scroll above position 0 once underwater (surface is the floor).
      if (el.scrollTop < minScrollTopRef.current) {
        el.scrollTop = minScrollTopRef.current;
        return; // re-fires with the corrected value
      }

      const progress = getAdjustedProgress();
      setScrollProgress(progress);
      // Underwater formula: scroll 0 = camY DIVE_END_Y (just below surface after dive),
      // scroll 100% = camY DIVE_END_Y - SCROLL_DEPTH_SCALE (abyss).
      // scroll=0 is always the top of the content — no above-water scroll zone.
      targetCamY.current = DIVE_END_Y - (progress * SCROLL_DEPTH_SCALE);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // When phase becomes "underwater", lock the camera at the dive endpoint and
  // set scroll to the matching position — no lerp, no float-back toward surface.
  // Formula (underwater): camY = -(progress × SCROLL_DEPTH_SCALE)
  //   → progress = -camY / SCROLL_DEPTH_SCALE
  useEffect(() => {
    if (phase !== "underwater") return;
    requestAnimationFrame(() => {
      const el = document.documentElement;
      const totalRange = el.scrollHeight - el.clientHeight;
      if (totalRange <= 0) return;

      // Land at scroll=0 (top of HeroSection) — no scroll offset.
      // Camera is at DIVE_END_Y (underwater) and stays there until the user scrolls.
      minScrollTopRef.current = 0;
      el.scrollTop = 0;
      setScrollProgress(0);
      targetCamY.current  = DIVE_END_Y;
      currentCamY.current = DIVE_END_Y;
      // Signal that scroll/camera are settled — fish intro can now begin.
      scrollReadyRef.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useFrame((_, delta) => {
    const p = phaseRef.current;

    if (p === "surface") {
      // Hold camera at above-water position — not scroll-driven yet
      camera.position.y = ABOVE_WATER_Y;
      currentCamY.current = ABOVE_WATER_Y;
      targetCamY.current  = ABOVE_WATER_Y;

    } else if (p === "diving") {
      // Animate camera downward through the water surface
      diveTimer.current = Math.min(diveTimer.current + delta, DIVE_DURATION);
      const t    = diveTimer.current / DIVE_DURATION;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      const y    = THREE.MathUtils.lerp(ABOVE_WATER_Y, DIVE_END_Y, ease);
      camera.position.y      = y;
      currentCamY.current    = y;

      if (diveTimer.current >= DIVE_DURATION && !diveDone.current) {
        diveDone.current = true;
        markUnderwater(DIVE_END_Y);
      }

    } else {
      // "underwater" — scroll-driven camera (lerped for smoothness)
      currentCamY.current = THREE.MathUtils.lerp(currentCamY.current, targetCamY.current, 0.06);
      camera.position.y   = currentCamY.current;
    }

    camera.lookAt(0, 5, -10);
    gl.setClearColor(lerpColor(scrollProgress), 1);
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#ffb877" />
      <directionalLight position={[3, 5, -8]} intensity={2.5} color="#ffcc88" />
      <directionalLight position={[-4, 2, 3]} intensity={0.8} color="#7dd3fc" />
      <pointLight position={[0, 2, 4]} intensity={3} color="#ff8844" distance={20} />
      <WaterEffects />
      <WaterSurface />
      <SkyElements />
      <HeroElements />
      <Bubbles />
      <BioParticles />
      <DeepCreatures />
      <fog attach="fog" args={["#020817", 30, 80]} />
      <EffectComposer>
        <WaterEntryEffect />
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.38}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
