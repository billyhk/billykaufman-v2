"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";


// Must stay in sync with DepthGauge / ZoneColorSync stops
const STOPS     = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
// Pressure ≈ 1 ATM per 10 m of seawater
const PRESSURES = [1, 6, 21, 51, 101, 381] as const;

// Must match HudBrackets SIDE so the gauge line continues from the bracket corner
const LINE_LEFT = 18; // px from viewport left edge

export default function HudSensorPanel() {
  const [pressure, setPressure] = useState(1);

  const { scrollYProgress } = useScroll();
  const pressMV = useTransform(scrollYProgress, [...STOPS], [...PRESSURES]);
  useMotionValueEvent(pressMV, "change", (v) => setPressure(Math.round(v)));

  return (
    <div
      className="fixed bottom-0 z-40 pointer-events-none select-none hidden md:block"
      style={{ top: "64px", left: 0, width: `${LINE_LEFT + 20}px` }}
    >
      {/* Line — draws downward from nav at t=0, same time as HUD corners */}
      <motion.div
        className="absolute inset-y-0 w-px"
        style={{
          left: `${LINE_LEFT}px`,
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
        className="absolute top-1/2"
        style={{
          left: `${LINE_LEFT}px`,
          transform: "translateX(-50%) translateY(-50%)",
          writingMode: "vertical-lr",
          color: "var(--zone-accent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span className="block text-[9px] font-mono tracking-[0.3em] uppercase opacity-40 mb-1">press</span>
        <span className="block text-[11px] font-mono tabular-nums opacity-70">{pressure} ATM</span>
      </motion.div>
    </div>
  );
}
