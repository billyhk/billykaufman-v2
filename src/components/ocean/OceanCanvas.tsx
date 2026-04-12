"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import OceanScene from "./OceanScene";

// ─── SCROLL ISSUE DEMO BRANCH ────────────────────────────────────────────────
//
// This branch reproduces the mobile scroll lock bug found on this site.
//
// ROOT CAUSE:
//   React Three Fiber's <Canvas> renders two wrapper divs internally. The outer
//   one hardcodes `pointer-events: auto` via inline style — overriding the CSS
//   class `pointer-events-none` on our wrapper div (CSS classes lose to inline styles).
//
//   Since OceanCanvas is `fixed inset-0`, the R3F inner div becomes the actual
//   touch target for the ENTIRE viewport. Its `touch-action` resolves to `auto`
//   (not pan-y), so the browser is free to detect any scroll axis on the first
//   gesture — causing scroll lock / spring-back on mobile.
//
// THE FIX (one line):
//   Pass `style={{ pointerEvents: "none", touchAction: "pan-y" }}` to <Canvas>.
//   R3F spreads this into the inner div's style after its own values, so ours wins.
//
// TO REPRODUCE: keep the style prop on <Canvas> commented out (see below).
// TO FIX:       uncomment it.
// ─────────────────────────────────────────────────────────────────────────────

export default function OceanCanvas() {
  useEffect(() => {
    // ── DEBUG: log every touchstart so you can see which element is intercepting ──
    const onTouch = (e: TouchEvent) => {
      const t = e.target as Element;
      const cs = window.getComputedStyle(t);
      console.group("%c[ScrollDebug] touchstart intercepted", "color: #f97316; font-weight: bold");
      console.log("Target element:   ", t);
      console.log("tag / class:      ", t.tagName, `"${t.className}"`);
      console.log("pointer-events:   ", cs.pointerEvents, "← 'auto' means this element IS receiving the touch");
      console.log("touch-action:     ", cs.touchAction,   "← 'auto' allows any scroll direction (bug); 'pan-y' restricts to vertical (fix)");
      console.log(
        cs.pointerEvents === "auto" && cs.touchAction === "auto"
          ? "%c⚠ This element has both pointer-events:auto AND touch-action:auto — the browser will use the first gesture to detect scroll axis, potentially locking to horizontal."
          : "%c✓ touch-action is restricted — vertical scroll should work.",
        cs.pointerEvents === "auto" && cs.touchAction === "auto" ? "color: #ef4444" : "color: #22c55e"
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
        // ── THE FIX ──────────────────────────────────────────────────────────
        // R3F hardcodes pointer-events: auto on its inner div (inline style),
        // which overrides the wrapper's pointer-events-none CSS class.
        // Passing style here overrides R3F's value (our key beats theirs because
        // it's spread last). Without this, the R3F div is the touch target for
        // the whole viewport with touch-action: auto → scroll axis lock on mobile.
        //
        // style={{ pointerEvents: "none", touchAction: "pan-y" }}
        // ─────────────────────────────────────────────────────────────────────
      >
        <Suspense fallback={null}>
          <OceanScene />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
