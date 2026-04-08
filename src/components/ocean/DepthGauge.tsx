"use client";

import { useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

// Scroll progress stops → matching ocean depths (m)
// Section order: Hero → About → Experience → Projects → Skills → Footer
const STOPS = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
const DEPTHS = [0, 50, 200, 500, 1000, 3800] as const;

export default function DepthGauge() {
  const [depth, setDepth] = useState(0);
  const { scrollYProgress } = useScroll();

  const depthMV = useTransform(scrollYProgress, [...STOPS], [...DEPTHS]);

  useMotionValueEvent(depthMV, "change", (v) => {
    setDepth(Math.round(v));
  });

  return (
    <div
      className="fixed top-0 bottom-0 z-40 pointer-events-none select-none hidden md:flex flex-col items-center justify-center gap-3"
      style={{ right: "max(0.75rem, calc((100vw - 64rem) / 2))" }}
    >
      {/* Fade in from top */}
      <div className="w-px h-24 bg-gradient-to-b from-transparent to-white/20" />

      {/* Live depth readout — vertical, reads top → bottom */}
      <div className="flex flex-col items-center gap-1.5" style={{ writingMode: "vertical-lr" }}>
        <span className="text-white/20 text-[9px] font-mono tracking-[0.3em] uppercase">depth</span>
        <span className="text-white/45 text-[11px] font-mono tabular-nums">{depth}m</span>
      </div>

      {/* Fade out to bottom */}
      <div className="w-px h-24 bg-gradient-to-t from-transparent to-white/20" />
    </div>
  );
}
