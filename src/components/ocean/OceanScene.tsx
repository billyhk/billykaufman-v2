"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";

// Depth color stops: surface → abyss
const DEPTH_COLORS = [
  new THREE.Color("#0a2a4a"), // 0.0 - surface, dark ocean blue
  new THREE.Color("#07203a"), // 0.2 - shallow
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

  const { positions, speeds, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      speeds[i] = 0.005 + Math.random() * 0.015;
      sizes[i] = 0.5 + Math.random() * 2.5;
    }
    return { positions, speeds, sizes };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      // wrap: when bubble rises past top, reset to bottom
      if (pos[i * 3 + 1] > 40) {
        pos[i * 3 + 1] = -40;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#7dd3fc"
        transparent
        opacity={0.18}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── Bioluminescent specks (glow deeper) ──────────────────────────────────────
function BioParticles({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = -20 - Math.random() * 60; // lower half only
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
      <pointsMaterial
        size={0.06}
        color="#4ade80"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}


// ── Main scene ────────────────────────────────────────────────────────────────
export default function OceanScene() {
  const { camera, gl } = useThree();
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetCamY = useRef(0);
  const currentCamY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(isNaN(progress) ? 0 : progress);
      // camera travels -60 units over full scroll
      targetCamY.current = -progress * 60;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    // smooth camera follow
    currentCamY.current = THREE.MathUtils.lerp(currentCamY.current, targetCamY.current, 0.06);
    camera.position.y = currentCamY.current;

    // update background color
    const color = lerpColor(scrollProgress);
    gl.setClearColor(color, 1);
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#bae6fd" />
      <directionalLight position={[5, 20, 5]} intensity={0.6} color="#e0f2fe" />
      <Bubbles />
      <BioParticles />
      <fog attach="fog" args={["#020817", 30, 80]} />
    </>
  );
}
