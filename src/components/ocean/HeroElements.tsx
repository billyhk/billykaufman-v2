"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useScenePhase } from "@/context/ScenePhaseContext";


// ── Cursor fish ───────────────────────────────────────────────────────────────
// Intro animation: swim toward camera → swipe L→R off screen → rise from bottom to cursor
const INTRO_DELAY    = 0.65;  // wait for HUD structure to finish drawing
const INTRO_APPROACH = 1.6;   // swim from z=-8 to foreground while facing camera
const INTRO_SWIPE    = 0.85;  // swipe left → right, exiting off-screen right
const INTRO_RISE     = 0.9;   // swim up from off-screen bottom to cursor position
export const INTRO_TOTAL = INTRO_DELAY + INTRO_APPROACH + INTRO_SWIPE + INTRO_RISE;

useGLTF.preload("/models/clownfish_cursor.glb");

function CursorFish() {
  const fishRef      = useRef<THREE.Group>(null);
  const innerRef     = useRef<THREE.Group>(null); // inner group — Y rotation controls facing camera vs. right
  const lightRef     = useRef<THREE.PointLight>(null);
  const { camera, size } = useThree();
  const { scene, animations } = useGLTF("/models/clownfish_cursor.glb");
  const { mixer } = useAnimations(animations, fishRef);
  const { phaseRef, scrollReadyRef } = useScenePhase();

  const _vec   = useMemo(() => new THREE.Vector3(), []);
  const _dir   = useMemo(() => new THREE.Vector3(), []);
  const _fwd   = useMemo(() => new THREE.Vector3(), []);
  const _qBill = useMemo(() => new THREE.Quaternion(), []);
  const _axZ   = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const cursor = useRef({ x: 0, y: 0 });
  const prevWorld = useRef(new THREE.Vector2());
  const smoothAngle = useRef(0);
  const isClickable = useRef(false);
  const glow = useRef(0);
  const scrollProgress = useRef(0);
  const actionRef    = useRef<THREE.AnimationAction | null>(null);
  const handoffStart = useRef(0);
  const introEndPos  = useRef(new THREE.Vector2(2, 0));
  const riseTarget   = useRef<THREE.Vector2 | null>(null); // cursor position captured at rise start
  // Clock time captured on the first frame the camera is below water.
  // All intro timing is relative to this (not absolute clock time) so the
  // intro always plays correctly regardless of when the visitor dives in.
  const introStartET = useRef<number | null>(null);
  // World-space Y at z=2 where the fish should swipe through the name text.
  // Computed once from the DOM on the first underwater frame so it's always
  // exact regardless of viewport height.
  const swipeY = useRef<number | null>(null);

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
      if (!e.isTrusted) return; // ignore synthetic fish-swipe events — don't corrupt cursor position
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

  // Cursor is managed per-frame based on camera depth (see useFrame below)
  useEffect(() => {
    return () => { document.body.style.cursor = ""; };
  }, []);

  // Track above/below water state to toggle cursor exactly once on transition
  const isAboveWater = useRef(true);

  useFrame(({ clock, camera }, delta) => {
    if (!fishRef.current) return;

    // Fish is only active once the dive animation has fully completed AND
    // the camera is below the surface. During the dive itself (phase="diving"),
    // keep the fish hidden so it doesn't pop in at the water surface mid-animation.
    const phaseReady = phaseRef.current === "underwater";
    const aboveNow   = !phaseReady || camera.position.y > 0.2;

    if (aboveNow !== isAboveWater.current) {
      isAboveWater.current = aboveNow;
      document.body.style.cursor = aboveNow ? "" : "none";
    }
    if (aboveNow) {
      fishRef.current.visible = false;
      return;
    }
    if (!mixer || !animations[0]) return;
    fishRef.current.visible = true;
    if (document.body.style.cursor !== "none") document.body.style.cursor = "none";

    // Wait until the scroll handoff rAF has completed before starting the intro,
    // so the fish never animates from a partially-resolved camera/scroll position.
    if (!scrollReadyRef.current) { fishRef.current.visible = false; return; }

    // Measure the name canvas world-Y once, on the first ready frame.
    // getBoundingClientRect → NDC → unproject → ray to z=2 plane.
    if (swipeY.current === null) {
      const el = document.getElementById("name-particles");
      if (el) {
        const rect = el.getBoundingClientRect();
        const screenCY = rect.top + rect.height / 2;
        const ndcY = 1 - (screenCY / window.innerHeight) * 2;
        _vec.set(0, ndcY, 0.5).unproject(camera);
        _dir.copy(_vec).sub(camera.position).normalize();
        const ray_t = (2 - camera.position.z) / _dir.z;
        swipeY.current = camera.position.y + _dir.y * ray_t;
      } else {
        swipeY.current = -1.2; // fallback if DOM not ready
      }
    }

    // Capture clock time on the first ready frame so intro timing is always
    // relative to when the visitor actually arrives underwater.
    if (introStartET.current === null) introStartET.current = clock.elapsedTime;
    const et = clock.elapsedTime - introStartET.current;

    // Project cursor ray from camera
    _vec.set(cursor.current.x, cursor.current.y, 0.5).unproject(camera);
    _dir.copy(_vec).sub(camera.position).normalize();

    // z=2 plane intersection — used only by intro phases (camera is always at y≈-2 then)
    const ray_t = (2 - camera.position.z) / _dir.z;
    const wx = camera.position.x + _dir.x * ray_t;
    const wy = camera.position.y + _dir.y * ray_t;

    // Place fish on the plane perpendicular to the camera's forward axis at depth FISH_DIST.
    // Ray-distance alone makes the fish larger at screen edges (ray diverges from forward,
    // giving a shallower camera-Z). Forward-plane intersection keeps camera-Z constant
    // → fish appears the same size regardless of where the cursor is on screen.
    const FISH_DIST = 3.0;
    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    const fwdDot = _dir.dot(_fwd);
    const ft = fwdDot > 0.01 ? FISH_DIST / fwdDot : FISH_DIST;
    const cwx = camera.position.x + _dir.x * ft;
    const cwy = camera.position.y + _dir.y * ft;
    const cwz = camera.position.z + _dir.z * ft;

    // ── Intro animation ──────────────────────────────────────────────────────
    if (et < INTRO_TOTAL) {
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
        fy = THREE.MathUtils.lerp(0, swipeY.current ?? -1.2, ease); // descend toward name center
        targetAngle = 0; // outer stays neutral; inner handles the 3-D facing

        // Pivot: face camera for first 65% of approach, then rotate to face right
        const pivotP = Math.max(0, (p - 0.65) / 0.35);
        if (innerRef.current)
          innerRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, pivotP);

      } else if (elapsed < INTRO_APPROACH + INTRO_SWIPE) {
        // Swipe left → right, exiting off-screen right
        const p    = (elapsed - INTRO_APPROACH) / INTRO_SWIPE;
        const ease = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3) / 2;
        fz = 2;
        fx = THREE.MathUtils.lerp(-5, 9, ease); // 9 = safely off-screen right
        fy = swipeY.current ?? -1.2; // world Y of name center, measured from DOM
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
        // Rise: snap to off-screen bottom at cursor x, swim up to cursor position
        const riseP    = Math.min((elapsed - INTRO_APPROACH - INTRO_SWIPE) / INTRO_RISE, 1);
        const riseEase = 1 - Math.pow(1 - riseP, 3); // easeOutCubic

        // Capture cursor world position on first frame of rise
        if (!riseTarget.current) riseTarget.current = new THREE.Vector2(wx, wy);

        fz = 2;
        fx = THREE.MathUtils.lerp(riseTarget.current.x, wx, riseEase); // drift x to live cursor
        fy = THREE.MathUtils.lerp(-5, wy, riseEase);                   // rise up from below screen
        targetAngle = THREE.MathUtils.lerp(Math.PI / 2, 0, riseP);     // arc from pointing up → pointing right

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

      // First frame of cursor-following — lerp from intro end position
      if (handoffStart.current === 0) {
        handoffStart.current = et;
        introEndPos.current.set(fishRef.current.position.x, fishRef.current.position.y);
        prevWorld.current.set(introEndPos.current.x, introEndPos.current.y);
      }

      const elapsed = et - handoffStart.current;

      let px: number, py: number;
      if (elapsed < HANDOFF_DUR) {
        // Smoothstep from intro end → cursor (fixed-distance target)
        const t = elapsed / HANDOFF_DUR;
        const s = t * t * (3 - 2 * t);
        px = THREE.MathUtils.lerp(introEndPos.current.x, cwx, s);
        py = THREE.MathUtils.lerp(introEndPos.current.y, cwy, s);
      } else {
        px = cwx;
        py = cwy;
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

      fishRef.current.position.set(px, py, cwz);
      // Billboard to camera then apply swim angle in camera space.
      // This keeps the fish as a side-on silhouette at all depths, even when the
      // camera tilts steeply upward at the abyss.
      _qBill.setFromAxisAngle(_axZ, smoothAngle.current);
      fishRef.current.quaternion.copy(camera.quaternion).multiply(_qBill);

      // innerRef.rotation.y = π/2 now rotates in camera space → always shows the side
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
      {!isTouch && <CursorFish />}
    </>
  );
}
