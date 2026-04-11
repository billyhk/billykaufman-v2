"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import HeroElements from "./HeroElements";
import DeepCreatures from "./DeepCreatures";

// Camera Y = -scrollProgress * SCROLL_DEPTH_SCALE. Shared with DeepCreatures depth values.
const SCROLL_DEPTH_SCALE = 60;

// Depth color stops: surface → abyss
const DEPTH_COLORS = [
  new THREE.Color("#12487a"), // 0.0 - surface, sunlit ocean blue
  new THREE.Color("#0a3358"), // 0.2 - shallow
  new THREE.Color("#05172c"), // 0.4 - mid water
  new THREE.Color("#030e1e"), // 0.6 - deep
  new THREE.Color("#010810"), // 0.8 - abyss
  new THREE.Color("#000408"), // 1.0 - void
];

function lerpColor(t: number): THREE.Color {
  const scaled = t * (DEPTH_COLORS.length - 1);
  const i = Math.min(Math.floor(scaled), DEPTH_COLORS.length - 2);
  const f = scaled - i;
  return DEPTH_COLORS[i].clone().lerp(DEPTH_COLORS[i + 1], f);
}

// ── Bubbles ───────────────────────────────────────────────────────────────────
function Bubbles({ count = 1800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i] = 0.005 + Math.random() * 0.015;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 40) pos[i * 3 + 1] = -40;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#7dd3fc" transparent opacity={0.18} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
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

  const getScrollProgress = () => {
    const el = document.documentElement;
    const p = el.scrollTop / (el.scrollHeight - el.clientHeight);
    return isNaN(p) ? 0 : p;
  };

  const [scrollProgress, setScrollProgress] = useState(getScrollProgress);
  const targetCamY  = useRef(-getScrollProgress() * SCROLL_DEPTH_SCALE);
  const currentCamY = useRef(-getScrollProgress() * SCROLL_DEPTH_SCALE);

  useEffect(() => {
    const onScroll = () => {
      const progress = getScrollProgress();
      setScrollProgress(progress);
      targetCamY.current = -progress * SCROLL_DEPTH_SCALE;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    currentCamY.current = THREE.MathUtils.lerp(currentCamY.current, targetCamY.current, 0.06);
    camera.position.y = currentCamY.current;
    gl.setClearColor(lerpColor(scrollProgress), 1);
  });

  return (
    <>
      <ambientLight intensity={0.6} color="#bae6fd" />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, -2, 3]} intensity={1} color="#7dd3fc" />
      <pointLight position={[0, 2, 4]} intensity={4} color="#38bdf8" distance={16} />
      <HeroElements />
      <Bubbles />
      <BioParticles />
      <DeepCreatures />
      <fog attach="fog" args={["#020817", 30, 80]} />
      <EffectComposer>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
