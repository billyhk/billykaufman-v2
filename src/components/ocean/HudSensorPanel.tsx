"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";


// Must stay in sync with DepthGauge / ZoneColorSync stops
const STOPS     = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
// Pressure ≈ 1 ATM per 10 m of seawater
const PRESSURES = [1, 6, 21, 51, 101, 381] as const;

// Must match HudBrackets SIDE so the gauge line continues from the bracket corner
const LINE_LEFT = 18; // px from viewport left edge

const TICK_POSITIONS = [0.25, 0.5, 0.75];

export default function HudSensorPanel() {
  const [pressure, setPressure]     = useState(1);
  const [scrollPct, setScrollPct]   = useState(0);
  const [thumbReady, setThumbReady] = useState(false);

  const { scrollYProgress } = useScroll();
  const pressMV = useTransform(scrollYProgress, [...STOPS], [...PRESSURES]);
  useMotionValueEvent(pressMV, "change", (v) => setPressure(Math.round(v)));

  useEffect(() => {
    const el = document.documentElement;
    const getProgress = () => el.scrollTop / (el.scrollHeight - el.clientHeight) || 0;
    setScrollPct(getProgress());
    const raf = requestAnimationFrame(() => setThumbReady(true));
    const onScroll = () => setScrollPct(getProgress());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      className="fixed z-40 pointer-events-none select-none hidden md:block overflow-hidden"
      style={{ top: "64px", bottom: "18px", left: 0, width: `${LINE_LEFT + 20}px` }}
    >
      {/* Rail — draws downward from nav at t=0 */}
      <motion.div
        className="absolute inset-y-0 w-px"
        style={{
          left: `${LINE_LEFT}px`,
          background: "linear-gradient(to bottom, transparent 2%, var(--zone-accent) 12%, var(--zone-accent) 88%, transparent 98%)",
          opacity: 0.2,
          transformOrigin: "top",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.55, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Tick marks — extend right into page, staggered top→bottom */}
      {TICK_POSITIONS.map((t, i) => (
        <motion.div
          key={t}
          className="absolute"
          style={{ top: `${t * 100}%`, left: `${LINE_LEFT}px`, transformOrigin: "left" }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.65 + i * 0.12, ease: "easeOut" }}
        >
          <div style={{ width: "6px", height: "1px", background: "var(--zone-accent)", opacity: 0.35 }} />
          <div style={{ width: "3px", height: "1px", background: "var(--zone-accent)", opacity: 0.2, marginTop: "3px" }} />
        </motion.div>
      ))}

      {/* Scroll thumb — mirrored: brackets extend right into page */}
      <motion.div
        className="absolute"
        style={{
          left: `${LINE_LEFT - 1}px`,
          top: `${scrollPct * 100}%`,
          transform: "translateY(-50%)",
          width: "3px",
          transition: thumbReady ? "top 0.12s ease-out" : "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.65 }}
      >
        <div style={{ width: "7px", height: "1px", background: "var(--zone-accent)", opacity: 0.9 }} />
        <div style={{ width: "3px", height: "22px", background: "var(--zone-accent)", opacity: 0.6 }} />
        <div style={{ width: "7px", height: "1px", background: "var(--zone-accent)", opacity: 0.9 }} />
      </motion.div>

      {/* Pressure readout */}
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
