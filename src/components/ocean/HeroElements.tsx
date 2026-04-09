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
// Intro animation: fish swims toward camera (facing front), pivots, swipes L→R, then follows cursor
const INTRO_DELAY    = 0.65;  // wait for HUD structure to finish drawing
const INTRO_APPROACH = 1.6;   // swim from z=-8 to foreground while facing camera
const INTRO_SWIPE    = 0.75;  // swipe left → right through the name
const INTRO_FADE     = 0.5;   // lerp to actual cursor position
const INTRO_TOTAL    = INTRO_DELAY + INTRO_APPROACH + INTRO_SWIPE + INTRO_FADE;

useGLTF.preload("/models/clownfish_cursor.glb");

function CursorFish() {
  const fishRef      = useRef<THREE.Group>(null);
  const innerRef     = useRef<THREE.Group>(null); // inner group — Y rotation controls facing camera vs. right
  const lightRef     = useRef<THREE.PointLight>(null);
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
  const actionRef    = useRef<THREE.AnimationAction | null>(null);
  const handoffStart = useRef(0);
  const introEndPos  = useRef(new THREE.Vector2(2, 0));
  const skipIntro    = useRef(false);

  // Skip intro if page wasn't at top on mount (e.g. refresh mid-scroll)
  useEffect(() => {
    if (window.scrollY > 10) skipIntro.current = true;
  }, []);

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
      const target = e.target;
      isClickable.current =
        target instanceof Element &&
        window.getComputedStyle(target).cursor === "pointer";
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

  useFrame(({ clock }, delta) => {
    if (!fishRef.current) return;

    const et = clock.elapsedTime;

    // Project cursor to z=2 world plane — needed for fade handoff and cursor phase
    _vec.set(cursor.current.x, cursor.current.y, 0.5).unproject(camera);
    _dir.copy(_vec).sub(camera.position).normalize();
    const ray_t = (2 - camera.position.z) / _dir.z;
    const wx = camera.position.x + _dir.x * ray_t;
    const wy = camera.position.y + _dir.y * ray_t;

    // ── Intro animation ──────────────────────────────────────────────────────
    if (!skipIntro.current && et < INTRO_TOTAL) {
      if (et < INTRO_DELAY) {
        fishRef.current.visible = false;
        return;
      }
      fishRef.current.visible = true;

      const elapsed = et - INTRO_DELAY;
      let fx: number, fy: number, fz: number, targetAngle: number;

      if (elapsed < INTRO_APPROACH) {
        // Swim from z=-8 to foreground; inner Y rotates from 0 (face camera) → π/2 (face right)
        const p    = elapsed / INTRO_APPROACH;
        const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
        fz = THREE.MathUtils.lerp(-8, 2, ease);
        fx = THREE.MathUtils.lerp(0, -5, ease); // drift left so swipe starts before the name
        fy = 0; // stay at viewport vertical centre throughout
        targetAngle = 0; // outer stays neutral; inner handles the 3-D facing

        // Pivot: face camera for first 65% of approach, then rotate to face right
        const pivotP = Math.max(0, (p - 0.65) / 0.35);
        if (innerRef.current)
          innerRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, pivotP);

      } else if (elapsed < INTRO_APPROACH + INTRO_SWIPE) {
        // Swipe left → right through the name text area
        const p    = (elapsed - INTRO_APPROACH) / INTRO_SWIPE;
        const ease = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3) / 2;
        fz = 2;
        fx = THREE.MathUtils.lerp(-5, 2, ease);
        fy = 0;
        targetAngle = 0; // face right

        if (innerRef.current)
          innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, Math.PI / 2, Math.min(delta * 10, 1));

        // Dispatch synthetic mousemove so name particles react to the fish passing through
        _vec.set(fx, fy, fz).project(camera);
        window.dispatchEvent(new MouseEvent("mousemove", {
          clientX: (_vec.x + 1) / 2 * window.innerWidth,
          clientY: (1 - _vec.y) / 2 * window.innerHeight,
          bubbles: true,
        }));
      } else {
        // Hold at swipe endpoint, smooth angle to horizontal — cursor takes over after INTRO_TOTAL
        fz = 2;
        fx = 2;
        fy = 0;
        targetAngle = 0;

        if (innerRef.current)
          innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, Math.PI / 2, Math.min(delta * 10, 1));
      }

      let diff = targetAngle - smoothAngle.current;
      while (diff >  Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      smoothAngle.current += diff * Math.min(delta * 5, 1);

      fishRef.current.position.set(fx, fy, fz);
      fishRef.current.rotation.z = smoothAngle.current;
      prevWorld.current.set(wx, wy); // track real cursor so handoff is velocity-free

    // ── Cursor following ─────────────────────────────────────────────────────
    } else {
      const HANDOFF_DUR = 0.5;

      // First frame of cursor-following
      if (handoffStart.current === 0) {
        if (skipIntro.current) {
          // Intro never played — snap directly to cursor, no lerp
          handoffStart.current = -1;
          prevWorld.current.set(wx, wy);
        } else {
          handoffStart.current = et;
          introEndPos.current.set(fishRef.current.position.x, fishRef.current.position.y);
          prevWorld.current.set(introEndPos.current.x, introEndPos.current.y);
        }
      }

      const elapsed = handoffStart.current === -1 ? HANDOFF_DUR : et - handoffStart.current;

      let px: number, py: number;
      if (elapsed < HANDOFF_DUR) {
        // Smoothstep from intro end → cursor
        const t = elapsed / HANDOFF_DUR;
        const s = t * t * (3 - 2 * t);
        px = THREE.MathUtils.lerp(introEndPos.current.x, wx, s);
        py = THREE.MathUtils.lerp(introEndPos.current.y, wy, s);
      } else {
        px = wx;
        py = wy;
      }

      const vx = px - prevWorld.current.x;
      const vy = py - prevWorld.current.y;
      const speed = Math.min(Math.sqrt(vx * vx + vy * vy) / delta, 150);
      prevWorld.current.set(px, py);

      if (speed > 0.3) {
        const target = Math.atan2(vy, vx);
        let diff = target - smoothAngle.current;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        smoothAngle.current += diff * Math.min(delta * 12, 1);
      }

      fishRef.current.position.set(px, py, 2);
      fishRef.current.rotation.z = smoothAngle.current;

      if (innerRef.current && Math.abs(innerRef.current.rotation.y - Math.PI / 2) > 0.001)
        innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, Math.PI / 2, Math.min(delta * 10, 1));
    }

    // Glow + swim speed — always active
    glow.current = THREE.MathUtils.lerp(glow.current, isClickable.current ? 1 : 0, delta * 8);
    // eslint-disable-next-line react-hooks/immutability
    for (const mat of mats.current) mat.emissiveIntensity = glow.current * 2.5;
    if (lightRef.current) lightRef.current.intensity = glow.current * 4;

    if (actionRef.current) {
      const targetSpeed = THREE.MathUtils.lerp(1.0, 0.25, scrollProgress.current);
      actionRef.current.timeScale = THREE.MathUtils.lerp(actionRef.current.timeScale, targetSpeed, delta * 2);
    }
  });

  return (
    <group ref={fishRef}>
      {/* innerRef.rotation.y: 0 = faces camera, π/2 = faces right (cursor mode) */}
      <group ref={innerRef} rotation={[0, 0, 0]}>
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
