"use client";

import { useRef, useState } from "react";
import { motion, useInView, useTransform, useMotionValueEvent } from "framer-motion";
import { useDepthScroll } from "@/context/DepthScrollContext";

const EASE = [0.25, 0.1, 0.25, 1] as const;

// Must stay in sync with DepthGauge.tsx
const STOPS  = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
const DEPTHS = [0,   50,  200,  500, 1000, 3800] as const;

export default function DepthLabel({ depth: _depth }: { depth: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [current, setCurrent] = useState(0);

  // Mirror the gauge — always the same value
  const { scrollYProgress } = useDepthScroll();
  const depthMV = useTransform(scrollYProgress, [...STOPS], [...DEPTHS]);

  useMotionValueEvent(depthMV, "change", (v) => {
    setCurrent(Math.round(v));
  });

  return (
    <div ref={ref} className="flex items-center gap-2.5 mb-6 select-none">
      {/* Tick line draws in */}
      <motion.div
        className="w-3 h-px"
        style={{ backgroundColor: "var(--zone-accent)", opacity: 0.45, transformOrigin: "left center" }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.3, ease: EASE }}
      />
      {/* Dot pops in */}
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "var(--zone-accent)" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 0.4 } : {}}
        transition={{ duration: 0.2, delay: 0.15, ease: EASE }}
      />
      {/* Live gauge value — always matches the right-side readout */}
      <motion.span
        className="text-[10px] tracking-[0.25em] uppercase font-mono tabular-nums"
        style={{ color: "var(--zone-accent)" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.5 } : {}}
        transition={{ duration: 0.15, delay: 0.2 }}
      >
        {current}m
      </motion.span>
    </div>
  );
}
