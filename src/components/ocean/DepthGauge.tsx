"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";


const STOPS  = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
const DEPTHS = [0, 50, 200, 500, 1000, 3800] as const;

// Must match HudBrackets INSET so the gauge line continues from the bracket corner
const LINE_RIGHT = 18; // px from viewport right edge

const TICK_POSITIONS = [0.25, 0.5, 0.75]; // fraction of rail height

export default function DepthGauge() {
  const [depth, setDepth]       = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  const { scrollYProgress } = useScroll();
  const depthMV = useTransform(scrollYProgress, [...STOPS], [...DEPTHS]);
  useMotionValueEvent(depthMV, "change", (v) => setDepth(Math.round(v)));

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setScrollPct(el.scrollTop / (el.scrollHeight - el.clientHeight) || 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed z-40 pointer-events-none select-none hidden md:block overflow-hidden"
      style={{ top: "64px", bottom: "18px", right: 0, width: `${LINE_RIGHT + 20}px` }}
    >
      {/* Rail — draws downward from nav at t=0 */}
      <motion.div
        className="absolute inset-y-0 w-px"
        style={{
          right: `${LINE_RIGHT}px`,
          background: "linear-gradient(to bottom, transparent 2%, var(--zone-accent) 12%, var(--zone-accent) 88%, transparent 98%)",
          opacity: 0.2,
          transformOrigin: "top",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.55, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Tick marks — fade in with content */}
      {TICK_POSITIONS.map((t, i) => (
        <motion.div
          key={t}
          className="absolute"
          style={{
            top: `${t * 100}%`,
            right: `${LINE_RIGHT}px`,
            transformOrigin: "right",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.65 + i * 0.12, ease: "easeOut" }}
        >
          {/* Main tick */}
          <div style={{ width: "6px", height: "1px", background: "var(--zone-accent)", opacity: 0.35 }} />
          {/* Short secondary tick offset below */}
          <div style={{ width: "3px", height: "1px", background: "var(--zone-accent)", opacity: 0.2, marginTop: "3px" }} />
        </motion.div>
      ))}

      {/* Scroll thumb */}
      <motion.div
        className="absolute"
        style={{
          right: `${LINE_RIGHT - 1}px`,
          top: `${scrollPct * 100}%`,
          transform: "translateY(-50%)",
          width: "3px",
          transition: "top 0.12s ease-out",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.65 }}
      >
        {/* Top bracket */}
        <div style={{ width: "7px", height: "1px", background: "var(--zone-accent)", opacity: 0.9, marginLeft: "-4px" }} />
        {/* Body */}
        <div style={{ width: "3px", height: "22px", background: "var(--zone-accent)", opacity: 0.6 }} />
        {/* Bottom bracket */}
        <div style={{ width: "7px", height: "1px", background: "var(--zone-accent)", opacity: 0.9, marginLeft: "-4px" }} />
      </motion.div>

      {/* Depth readout — fades in with content */}
      <motion.div
        className="absolute top-1/2"
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
