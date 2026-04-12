"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import OceanScene from "./OceanScene";

// See docs/scroll-lock-rca.md for full root cause analysis and fix explanation.

export default function OceanCanvas() {
  useEffect(() => {
    // DEBUG: log every touchstart so you can see which element is intercepting the gesture
    const onTouch = (e: TouchEvent) => {
      const t = e.target as Element;
      const cs = window.getComputedStyle(t);
      console.group("%c[ScrollDebug] touchstart", "color: #f97316; font-weight: bold");
      console.log("target:         ", t);
      console.log("pointer-events: ", cs.pointerEvents,
        cs.pointerEvents === "auto" ? "← receiving touch (this element owns the gesture)" : "");
      console.log("touch-action:   ", cs.touchAction,
        cs.touchAction === "auto" ? "← any axis allowed (BUG)" : "← vertical only (FIXED)");
      console.log(
        cs.pointerEvents === "auto" && cs.touchAction === "auto"
          ? "%c⚠ touch-action:auto on the touch target — browser may lock to horizontal axis"
          : "%c✓ touch-action is restricted to pan-y — vertical scroll will work",
        cs.pointerEvents === "auto" && cs.touchAction === "auto" ? "color:#ef4444" : "color:#22c55e"
      );
      console.groupEnd();
    };
    window.addEventListener("touchstart", onTouch, { passive: true, capture: true });
    return () => window.removeEventListener("touchstart", onTouch, { capture: true });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ touchAction: "pan-y" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
        // THE FIX — uncomment to restore correct scroll behavior:
        // style={{ pointerEvents: "none", touchAction: "pan-y" }}
      >
        <Suspense fallback={null}>
          <OceanScene />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
