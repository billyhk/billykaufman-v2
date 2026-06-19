"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SkyElements — above-water scene objects: animated flamingo + horizon island
// Both hide themselves as soon as the camera drops below the water surface.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, useTexture } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/flying_flamingo.glb");
useGLTF.preload("/models/tropical_palm_tree.glb");

// ── Flamingo ──────────────────────────────────────────────────────────────────
// Flies across the sky from one side to the other, reverses direction, then
// waits off-screen before crossing again. Starts at a random progress point
// so it isn't always entering from the same edge on page load.

const CROSS_X_L   = -22;   // world X: left entry point
const CROSS_X_R   =  22;   // world X: right entry point
const CROSS_Y     =   7.5; // world Y: cruising altitude
const CROSS_Z     = -20;   // world Z: depth in scene
const CROSS_SPEED = 0.055; // fraction of crossing per second ≈ 18 s full pass

function Flamingo() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/flying_flamingo.glb");
  const { mixer } = useAnimations(animations, groupRef);

  const progress  = useRef(Math.random() * 0.5); // start somewhere mid-sky
  const dir       = useRef<1 | -1>(1);            // 1 = L→R, -1 = R→L
  const waiting   = useRef(false);
  const waitTimer = useRef(2 + Math.random() * 4);

  useEffect(() => {
    if (!mixer || animations.length === 0) return;
    const action = mixer.clipAction(animations[0]);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    return () => { action.stop(); };
  }, [mixer, animations]);

  useFrame(({ camera }, delta) => {
    if (!groupRef.current) return;

    // Hide while underwater
    const above = camera.position.y > 0.1;
    groupRef.current.visible = above;
    if (!above) return;

    mixer?.update(delta);

    if (waiting.current) {
      waitTimer.current -= delta;
      if (waitTimer.current <= 0) {
        waiting.current = false;
        dir.current = dir.current === 1 ? -1 : 1;
        progress.current = 0;
      }
      // Keep invisible while waiting off-screen
      groupRef.current.visible = false;
      return;
    }

    progress.current = Math.min(progress.current + delta * CROSS_SPEED, 1);

    if (progress.current >= 1) {
      waiting.current = true;
      waitTimer.current = 4 + Math.random() * 6;
      groupRef.current.visible = false;
      return;
    }

    const xFrom = dir.current === 1 ? CROSS_X_L : CROSS_X_R;
    const xTo   = dir.current === 1 ? CROSS_X_R : CROSS_X_L;
    const x     = THREE.MathUtils.lerp(xFrom, xTo, progress.current);
    // Gentle altitude wave so it doesn't look dead-straight
    const y     = CROSS_Y + Math.sin(progress.current * Math.PI * 2.5) * 0.5;

    groupRef.current.position.set(x, y, CROSS_Z);
    // Rotate so the bird faces its direction of travel; +π/2 = facing right
    groupRef.current.rotation.set(0, dir.current === 1 ? Math.PI / 2 : -Math.PI / 2, 0);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={.01} />
    </group>
  );
}

// ── Island ────────────────────────────────────────────────────────────────────
// Simple procedural island: flattened sandy sphere + palm tree.
// Positioned left-of-center on the horizon so it doesn't dominate the view.

// The sphere is sunk so its equator (widest point) is near the waterline.
// The narrowing bottom disappears below water — giving the "tip of a landmass" look.
const MOUND_Y_SCALE = 3.5;   // tall so the narrow base hides deep underwater
const GROUP_Y       = -2.5;  // world Y of group origin — keeps sphere equator near y=0

function Island() {
  const ref = useRef<THREE.Group>(null);
  const { scene: palmScene } = useGLTF("/models/tropical_palm_tree.glb");
  const [sandDiff, sandNor] = useTexture([
    "/textures/sand_diff.jpg",
    "/textures/sand_nor.jpg",
  ]);

  useMemo(() => {
    for (const tex of [sandDiff, sandNor]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 5);
    }
  }, [sandDiff, sandNor]);

  useFrame(({ camera }) => {
    if (ref.current) ref.current.visible = camera.position.y > 0.1;
  });

  return (
    <group ref={ref} position={[-14, GROUP_Y, -30]}>
      {/* Island body — tall sphere sunk into the water so it's widest at the surface */}
      <mesh scale={[8.0, MOUND_Y_SCALE, 8.0]}>
        <sphereGeometry args={[1, 24, 14]} />
        <meshStandardMaterial
          map={sandDiff}
          normalMap={sandNor}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Palm tree planted at the top of the mound */}
      <primitive
        object={palmScene}
        scale={.0035}
        position={[-3, MOUND_Y_SCALE - 1, 1]}
      />
    </group>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function SkyElements() {
  return (
    <>
      <Flamingo />
      <Island />
    </>
  );
}
