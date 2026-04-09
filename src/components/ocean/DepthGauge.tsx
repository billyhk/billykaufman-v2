"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";


const STOPS  = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
const DEPTHS = [0, 50, 200, 500, 1000, 3800] as const;

// Must match HudBrackets INSET so the gauge line continues from the bracket corner
const LINE_RIGHT = 18; // px from viewport right edge

export default function DepthGauge() {
  const [depth, setDepth] = useState(0);
  const { scrollYProgress } = useScroll();

  const depthMV = useTransform(scrollYProgress, [...STOPS], [...DEPTHS]);

  useMotionValueEvent(depthMV, "change", (v) => {
    setDepth(Math.round(v));
  });

  return (
    <div
      className="fixed bottom-0 z-40 pointer-events-none select-none hidden md:block"
      style={{ top: "64px", right: 0, width: `${LINE_RIGHT + 20}px` }}
    >
      {/* Line — draws downward from nav at t=0, same time as HUD corners */}
      <motion.div
        className="absolute inset-y-0 w-px"
        style={{
          right: `${LINE_RIGHT}px`,
          background: "linear-gradient(to bottom, transparent 5%, var(--zone-accent) 20%, var(--zone-accent) 80%, transparent 95%)",
          opacity: 0.28,
          transformOrigin: "top",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.55, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Text — fades in after structural elements are drawn */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: `${LINE_RIGHT}px`,
          transform: "translateX(50%) translateY(-50%)",
          writingMode: "vertical-lr",
          color: "var(--zone-accent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span className="block text-[9px] font-mono tracking-[0.3em] uppercase opacity-40 mb-1">depth</span>
        <span className="block text-[11px] font-mono tabular-nums opacity-70">{depth}m</span>
      </motion.div>
    </div>
  );
}
