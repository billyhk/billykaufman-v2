"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

function createSoftSprite() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.6)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// ── Depth-based spark color: surface → abyss ─────────────────────────────────
const SPARK_COLORS = [
  new THREE.Color("#67e8f9"), // 0  - surface: bright cyan
  new THREE.Color("#0ea5e9"), // 15 - shallow: ocean blue
  new THREE.Color("#0d9488"), // 30 - mid: teal
  new THREE.Color("#065f46"), // 45 - deep: dark green bio
  new THREE.Color("#1e1b4b"), // 60 - abyss: near-invisible indigo
];

function sparkColorAtDepth(camY: number): THREE.Color {
  // camY goes 0 → -60
  const t = THREE.MathUtils.clamp(-camY / 60, 0, 1);
  const scaled = t * (SPARK_COLORS.length - 1);
  const i = Math.min(Math.floor(scaled), SPARK_COLORS.length - 2);
  return SPARK_COLORS[i].clone().lerp(SPARK_COLORS[i + 1], scaled - i);
}

// Opacity also dims as you descend so sparks don't overpower dark sections
function sparkOpacityAtDepth(camY: number): number {
  return THREE.MathUtils.lerp(0.85, 0.25, THREE.MathUtils.clamp(-camY / 60, 0, 1));
}

// ── Cursor spark trail ────────────────────────────────────────────────────────
const MAX_SPARKS = 80;

function CursorSparks() {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const _vec = useMemo(() => new THREE.Vector3(), []);
  const _dir = useMemo(() => new THREE.Vector3(), []);

  // Each spark: position (x,y,z), age (0–1), velocity (vy)
  const sparks = useRef(
    Array.from({ length: MAX_SPARKS }, () => ({
      x: 0, y: -999, z: 2,
      vx: 0, vy: 0,
      age: 1, // start "dead"
    }))
  );
  const nextIdx = useRef(0);
  const cursor = useRef({ x: 0, y: 0 });
  const positions = useMemo(() => new Float32Array(MAX_SPARKS * 3), []);
  const opacities = useMemo(() => new Float32Array(MAX_SPARKS), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Unproject NDC cursor to world space at z=2 plane (accurate at any screen position)
    _vec.set(cursor.current.x, cursor.current.y, 0.5).unproject(camera);
    _dir.copy(_vec).sub(camera.position).normalize();
    const t = (2 - camera.position.z) / _dir.z;
    const worldX = camera.position.x + _dir.x * t;
    const worldY = camera.position.y + _dir.y * t;

    const spawnCount = 2;
    for (let s = 0; s < spawnCount; s++) {
      const idx = nextIdx.current % MAX_SPARKS;
      sparks.current[idx] = {
        x: worldX + (Math.random() - 0.5) * 0.3,
        y: worldY + (Math.random() - 0.5) * 0.3,
        z: 2,
        vx: (Math.random() - 0.5) * 0.08,
        vy: 0.05 + Math.random() * 0.12,
        age: 0,
      };
      nextIdx.current++;
    }

    // Update all bubbles
    for (let i = 0; i < MAX_SPARKS; i++) {
      const sp = sparks.current[i];
      sp.age += delta * 0.5; // slower fade = longer life
      sp.x += sp.vx * delta;
      sp.y += sp.vy * delta;
      // no gravity — bubbles float up steadily

      positions[i * 3 + 0] = sp.x;
      positions[i * 3 + 1] = sp.y;
      positions[i * 3 + 2] = sp.z;
      opacities[i] = sp.age < 1 ? Math.max(0, 1 - sp.age) : 0;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.geometry.attributes.opacity.needsUpdate = true;

    // Update color + opacity based on current depth
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.color.copy(sparkColorAtDepth(camera.position.y));
    mat.opacity = sparkOpacityAtDepth(camera.position.y);
  });

  const sprite = useMemo(() => createSoftSprite(), []);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-opacity" args={[opacities, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        map={sprite}
        alphaMap={sprite}
        color="#bae6fd"
        transparent
        opacity={0.45}
        alphaTest={0.001}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}


// ── Ambient floating orbs near hero ──────────────────────────────────────────
function HeroOrbs() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const orbs = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 4 - 1
        ),
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        size: 0.015 + Math.random() * 0.04,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const camY = camera.position.y;
    const opacity = THREE.MathUtils.clamp((camY + 5) / 5, 0, 1);
    groupRef.current.visible = opacity > 0;

    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.y =
        orbs[i].pos.y + Math.sin(clock.elapsedTime * orbs[i].speed + orbs[i].phase) * 0.4;
      (mesh.material as THREE.MeshBasicMaterial).opacity = opacity * (0.4 + Math.sin(clock.elapsedTime * orbs[i].speed + orbs[i].phase) * 0.2);
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.pos}>
          <sphereGeometry args={[orb.size, 8, 8]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Cursor fish ───────────────────────────────────────────────────────────────
useGLTF.preload("/models/clownfish_cursor.glb");

function CursorFish() {
  const fishRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();
  const { scene, animations } = useGLTF("/models/clownfish_cursor.glb");
  const { mixer } = useAnimations(animations, fishRef);

  const _vec = useMemo(() => new THREE.Vector3(), []);
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const cursor = useRef({ x: 0, y: 0 });
  const prevWorld = useRef(new THREE.Vector2());
  const smoothAngle = useRef(0);
  const isClickable = useRef(false);
  const glow = useRef(0);
  const scrollProgress = useRef(0);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  // Cache materials for glow updates
  const mats = useMemo(() => {
    const out: THREE.MeshStandardMaterial[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        out.push(obj.material as THREE.MeshStandardMaterial);
      }
    });
    return out;
  }, [scene]);

  useEffect(() => {
    if (!mixer || !animations[0]) return;
    const swimClip = THREE.AnimationUtils.subclip(animations[0], "swim", 171, 212, 30);
    const action = mixer.clipAction(swimClip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.play();
    actionRef.current = action;
    return () => { action.stop(); };
  }, [mixer, animations]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      scrollProgress.current = el.scrollTop / (el.scrollHeight - el.clientHeight) || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      isClickable.current =
        window.getComputedStyle(e.target as Element).cursor === "pointer";
    };
    window.addEventListener("mousemove", onMove);
    document.body.style.cursor = "none";
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((_, delta) => {
    if (!fishRef.current) return;

    _vec.set(cursor.current.x, cursor.current.y, 0.5).unproject(camera);
    _dir.copy(_vec).sub(camera.position).normalize();
    const t = (2 - camera.position.z) / _dir.z;
    const wx = camera.position.x + _dir.x * t;
    const wy = camera.position.y + _dir.y * t;

    const vx = wx - prevWorld.current.x;
    const vy = wy - prevWorld.current.y;
    const speed = Math.min(Math.sqrt(vx * vx + vy * vy) / delta, 150);
    prevWorld.current.set(wx, wy);

    if (speed > 0.3) {
      const target = Math.atan2(vy, vx);
      let diff = target - smoothAngle.current;
      while (diff >  Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      smoothAngle.current += diff * Math.min(delta * 12, 1);
    }

    fishRef.current.position.set(wx, wy, 2);
    fishRef.current.rotation.z = smoothAngle.current;

    // Lerp glow toward target
    glow.current = THREE.MathUtils.lerp(glow.current, isClickable.current ? 1 : 0, delta * 8);
    for (const mat of mats) mat.emissiveIntensity = glow.current * 2.5;
    if (lightRef.current) lightRef.current.intensity = glow.current * 4;

    // Slow animation with depth — 1.0 at surface, 0.25 at abyss
    if (actionRef.current) {
      const targetSpeed = THREE.MathUtils.lerp(1.0, 0.25, scrollProgress.current);
      actionRef.current.timeScale = THREE.MathUtils.lerp(actionRef.current.timeScale, targetSpeed, delta * 2);
    }
  });

  return (
    <group ref={fishRef}>
      <group rotation={[0, Math.PI / 2, Math.PI]}>
        <primitive object={scene} scale={2} />
      </group>
      <pointLight ref={lightRef} color="#ff6b35" intensity={0} distance={3} decay={2} />
    </group>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function HeroElements() {
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <>
      <HeroOrbs />
      {!isTouch && <CursorFish />}
    </>
  );
}
