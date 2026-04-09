"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";


// Must stay in sync with DepthGauge / ZoneColorSync stops
const STOPS  = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
const DEPTHS = [0, 50, 200, 500, 1000, 3800] as const;

// Must match HudBrackets SIDE so the gauge line continues from the bracket corner
const LINE_LEFT = 18; // px from viewport left edge

const TICK_POSITIONS = [0.25, 0.5, 0.75];

export default function HudSensorPanel() {
  const [pressure, setPressure] = useState(1);
  const thumbRef = useRef<HTMLDivElement>(null);

  const getProgress = () => {
    const el = document.documentElement;
    return el.scrollTop / (el.scrollHeight - el.clientHeight) || 0;
  };

  // Always false on SSR — avoids hydration mismatch; useEffect sets the real value
  const [show, setShow] = useState(false);
  const noIntro = useRef(false); // true = no intro played; set in useEffect

  const { scrollYProgress } = useScroll();
  const depthMV = useTransform(scrollYProgress, [...STOPS], [...DEPTHS]);
  // Absolute pressure: P_atm + ρ_sw·g·d / P₀
  // ρ_sw = 1025 kg/m³, g = 9.81 m/s², P₀ = 101 325 Pa → ~1 ATM per 10.066 m
  const ATM_PER_M = (1025 * 9.81) / 101325;
  useMotionValueEvent(depthMV, "change", (d) => setPressure(Math.round(1 + d * ATM_PER_M)));

  useEffect(() => {
    const introWillPlay = window.scrollY <= window.innerHeight * 0.5;
    noIntro.current = !introWillPlay;

    // Sync thumb to real scroll position (SSR always outputs top: 0%)
    const update = () => {
      if (thumbRef.current) thumbRef.current.style.top = `${getProgress() * 100}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });

    if (!introWillPlay) {
      setShow(true);
      return () => window.removeEventListener("scroll", update);
    }

    const t = setTimeout(() => setShow(true), INTRO_TOTAL * 1000);
    return () => {
      window.removeEventListener("scroll", update);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      className="fixed z-40 pointer-events-none select-none hidden md:block overflow-hidden"
      style={{ top: "64px", bottom: "18px", left: 0, width: `${LINE_LEFT + 20}px` }}
    >
      {/* Rail */}
      <motion.div
        className="absolute inset-y-0 w-px"
        style={{
          left: `${LINE_LEFT}px`,
          background: "linear-gradient(to bottom, transparent 2%, var(--zone-accent) 12%, var(--zone-accent) 88%, transparent 98%)",
          opacity: 0.2,
          transformOrigin: "top",
        }}
        initial={{ scaleY: 0 }}
        animate={show ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Tick marks */}
      {TICK_POSITIONS.map((t, i) => (
        <motion.div
          key={t}
          className="absolute"
          style={{ top: `${t * 100}%`, left: `${LINE_LEFT}px`, transformOrigin: "left" }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={show ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.3, delay: noIntro.current ? 0.65 + i * 0.12 : i * 0.12, ease: "easeOut" }}
        >
          <div style={{ width: "6px", height: "1px", background: "var(--zone-accent)", opacity: 0.35 }} />
          <div style={{ width: "3px", height: "1px", background: "var(--zone-accent)", opacity: 0.2, marginTop: "3px" }} />
        </motion.div>
      ))}

      {/* Scroll thumb */}
      <motion.div
        ref={thumbRef}
        className="absolute"
        style={{
          left: `${LINE_LEFT - 1}px`,
          top: "0%",
          transform: "translateY(-50%)",
          width: "3px",
        }}
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: noIntro.current ? 0.65 : 0.1 }}
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
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: noIntro.current ? 0.6 : 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span className="block text-[9px] font-mono tracking-[0.3em] uppercase opacity-40 mb-1">press</span>
        <span className="block text-[11px] font-mono tabular-nums opacity-70">{pressure} ATM</span>
      </motion.div>
    </div>
  );
}
