"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";


// ── Ambient floating orbs near hero ──────────────────────────────────────────
// Generated once at module load — static data, no need to recompute per render
const ORB_DATA = Array.from({ length: 18 }, () => ({
  pos: new THREE.Vector3(
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 5,
    (Math.random() - 0.5) * 4 - 1
  ),
  speed: 0.2 + Math.random() * 0.5,
  phase: Math.random() * Math.PI * 2,
  size: 0.015 + Math.random() * 0.04,
}));

function HeroOrbs() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const orbs = ORB_DATA;

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
  const { camera, size } = useThree();
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
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useEffect(() => {
    const out: THREE.MeshStandardMaterial[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        out.push(obj.material as THREE.MeshStandardMaterial);
      }
    });
    mats.current = out;
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
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.style.cursor = "";
    };
  }, []);

  // Only hide cursor once the model + animation are ready
  useEffect(() => {
    if (!mixer || !animations[0]) return;
    document.body.style.cursor = "none";
    return () => { document.body.style.cursor = ""; };
  }, [mixer, animations]);

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
    // eslint-disable-next-line react-hooks/immutability
    for (const mat of mats.current) mat.emissiveIntensity = glow.current * 2.5;
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
        <primitive object={scene} scale={Math.min(5, Math.max(2, 2160 / size.height))} />
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
