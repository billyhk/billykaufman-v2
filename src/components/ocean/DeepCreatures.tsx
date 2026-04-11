"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Ease-out-back: smooth deceleration with a slight overshoot before settling.
// t: 0→1. Returns 0→1 with a small spring past 1 then back.
function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Clone each mesh material so we can control opacity without mutating the
// cached GLTF scene shared by useGLTF.
function prepareMaterials(root: THREE.Object3D): THREE.Material[] {
  const mats: THREE.Material[] = [];
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const mat = (obj.material as THREE.Material).clone();
      mat.transparent = true;
      mat.depthWrite = false;
      obj.material = mat;
      mats.push(mat);
    }
  });
  return mats;
}

// ── Shark — epipelagic (~150m), slow patrol ───────────────────────────────────
// Z≈-16: well behind the cursor/clownfish layer (Z≈0).
// Direction handled via scale.x flip — avoids guessing the model's facing axis.

function Shark({ depth = -15 }: { depth: number }) {
  const groupRef   = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/great_white_shark.glb");
  const { actions } = useAnimations(animations, groupRef);
  const { camera }  = useThree();
  const matsRef     = useRef<THREE.Material[]>([]);
  const xRef        = useRef(0);
  const speedRef    = useRef(0.02);
  // 0 = right (+X after inner base rotation), -Math.PI = left (-X).
  // Lerping 0 → -π passes through -π/2 = facing camera (+Z). Same on return.
  const facingRef      = useRef(0);
  const rotStartRef    = useRef(0);
  const rotYRef        = useRef(0);
  const turnProgressRef = useRef(1); // 1 = not turning

  useEffect(() => {
    matsRef.current = prepareMaterials(scene);
  }, [scene]);

  useEffect(() => {
    actions["Swim"]?.play();
  }, [actions]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const camY    = camera.position.y;
    const opacity = THREE.MathUtils.clamp(1 - Math.abs(camY - depth) / 6, 0, 0.75);
    groupRef.current.visible = opacity > 0;
    if (opacity <= 0) return;

    // Always move
    xRef.current += speedRef.current;

    if (turnProgressRef.current >= 1) {
      if (xRef.current > 12 && speedRef.current > 0) {
        rotStartRef.current    = rotYRef.current;
        facingRef.current      = -Math.PI;
        turnProgressRef.current = 0;
        speedRef.current       = -Math.abs(speedRef.current);
      } else if (xRef.current < -12 && speedRef.current < 0) {
        rotStartRef.current    = rotYRef.current;
        facingRef.current      = 0;
        turnProgressRef.current = 0;
        speedRef.current       = Math.abs(speedRef.current);
      }
    }

    // Advance turn progress and apply easeOutBack curve
    if (turnProgressRef.current < 1) {
      turnProgressRef.current = Math.min(turnProgressRef.current + 0.022, 1);
      rotYRef.current = rotStartRef.current +
        (facingRef.current - rotStartRef.current) * easeOutBack(turnProgressRef.current);
    }

    const t = clock.elapsedTime;
    groupRef.current.scale.set(2.5, 2.5, 2.5);
    groupRef.current.rotation.y = rotYRef.current;
    groupRef.current.position.set(xRef.current, depth + Math.sin(t * 0.4) * 0.5, -16);
    for (const mat of matsRef.current) (mat as THREE.MeshStandardMaterial).opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      {/* Model faces +Z by default; +90° base rotation aligns it to face +X (right) */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// ── Jellyfish — mesopelagic (~400m), rises from below and drifts into distance ─
// Enters from below depth, floats upward, and recedes into distance (Z) as it rises.

function Jellyfish({
  depth = -33,
  xOffset = 0,
}: {
  depth: number;
  xOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/liriope_jellyfish_trachymedusae.glb");
  const { actions } = useAnimations(animations, groupRef);
  const { camera } = useThree();
  const matsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    matsRef.current = prepareMaterials(scene);
  }, [scene]);

  useEffect(() => {
    actions["100"]?.play();
  }, [actions]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const camY = camera.position.y;

    // Asymmetric window: gradual reveal as camera descends toward depth, quick exit after.
    // Handoff: shark exits at camY≈-21, jellyfish starts at camY=-21 — no overlap.
    const above    = camY - depth; // positive = camera is above jellyfish
    const fadeIn   = THREE.MathUtils.clamp(1 - above / 12, 0, 1);
    const fadeOut  = THREE.MathUtils.clamp(1 + above / 7, 0, 1);
    const proximity = fadeIn * fadeOut;
    groupRef.current.visible = proximity > 0;
    if (proximity <= 0) return;

    const t = clock.elapsedTime;

    // Time-based rise keeps the jellyfish drifting upward, reading as rising from below.
    const rise   = (t * 0.18) % 14;
    const yPos   = depth - 4 + rise;
    const xDrift = xOffset + Math.sin(t * 0.13) * 2.5;

    // Scroll-driven approach: scale up and move forward as camera nears
    const zDepth   = THREE.MathUtils.lerp(-24, -13, proximity);
    const scaleVal = THREE.MathUtils.lerp(0.3, 0.9, proximity);
    groupRef.current.scale.set(scaleVal, scaleVal, scaleVal);

    // Fade out near loop reset so the position jump is invisible
    const phaseOpacity = rise > 12 ? (14 - rise) / 2 : 1;

    groupRef.current.position.set(xDrift, yPos, zDepth);
    // eslint-disable-next-line react-hooks/immutability
    for (const mat of matsRef.current) (mat as THREE.MeshStandardMaterial).opacity = proximity * 0.65 * phaseOpacity;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ── Firefly squid — bathypelagic (~1000m+), near-abyss ───────────────────────
// Z≈-19: furthest back, bioluminescent glow will bloom nicely in the dark.

function FireflySquid({ depth = -54 }: { depth: number }) {
  const groupRef   = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/firefly_squid_glowing.glb");
  const { actions } = useAnimations(animations, groupRef);
  const { camera }  = useThree();
  const matsRef = useRef<THREE.Material[]>([]);
  const rotYRef = useRef(0);

  useEffect(() => {
    // Squid is fully emissive (black base + white glow). Additive blending
    // makes the black base invisible and lets the emissive glow add to the scene,
    // exactly like bioluminescence. Bloom will then pick it up beautifully.
    const mats: THREE.Material[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = (obj.material as THREE.Material).clone();
        mat.transparent = true;
        mat.depthWrite  = false;
        (mat as THREE.MeshStandardMaterial).blending = THREE.AdditiveBlending;
        obj.material = mat;
        mats.push(mat);
      }
    });
    matsRef.current = mats;
  }, [scene]);

  useEffect(() => {
    actions["Take 001"]?.play();
  }, [actions]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const camY    = camera.position.y;
    const opacity = THREE.MathUtils.clamp(1 - Math.abs(camY - depth) / 14, 0, 0.5);
    groupRef.current.visible = opacity > 0;
    if (opacity <= 0) return;

    const t = clock.elapsedTime;

    // Sinusoidal patrol — decelerates naturally at extremes, no hard boundary flip
    const xPos = Math.sin(t * 0.12) * 22;
    const xVel = Math.cos(t * 0.12); // positive → moving right

    // Rotation lazily follows velocity direction; passes through camera-facing mid-turn
    const targetRot = xVel >= 0 ? 0 : Math.PI;
    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, targetRot, 0.005);

    groupRef.current.scale.set(1, 1, 1);
    groupRef.current.rotation.y = rotYRef.current;
    groupRef.current.position.set(xPos, depth - 1 + Math.sin(t * 0.4) * 0.3, -19);
    // eslint-disable-next-line react-hooks/immutability
    for (const mat of matsRef.current) (mat as THREE.MeshStandardMaterial).opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
//  Camera Y = -scrollProgress * 60
//
//  Y ≈ -15  (~20–30% scroll)  → shark patrols the sunlit shallows
//  Y ≈ -33  (~50–60% scroll)  → jellyfish rises through the twilight zone
//  Y ≈ -54  (~85–100% scroll) → anglerfish drifts in the abyss

export default function DeepCreatures() {
  return (
    <>
      <Shark      depth={-15} />
      <Jellyfish  depth={-33} xOffset={5} />
      <FireflySquid depth={-59} />
    </>
  );
}

// Preload all models so they're ready before the user scrolls to them
useGLTF.preload("/models/great_white_shark.glb");
useGLTF.preload("/models/liriope_jellyfish_trachymedusae.glb");
useGLTF.preload("/models/firefly_squid_glowing.glb");
