"use client";

import { useEffect } from "react";
import { useTransform, useMotionValueEvent } from "framer-motion";
import { useDepthScroll } from "@/context/DepthScrollContext";

// Must stay in sync with DepthGauge.tsx scroll stops
const STOPS = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;

// Color per depth zone:
// sunlight (0m) → mesopelagic (50m) → bathypelagic (200m) →
// abyssopelagic (500m) → bioluminescent hadal (1000m) → deep hadal (3800m)
const COLORS = [
  "#67e8f9", // cyan-300
  "#60a5fa", // blue-400
  "#a78bfa", // violet-400
  "#818cf8", // indigo-400
  "#34d399", // emerald-400 — bioluminescent
  "#10b981", // emerald-500
] as const;

export const ZONE_COLORS = COLORS;

export default function ZoneColorSync() {
  const { scrollYProgress } = useDepthScroll();

  // Framer Motion interpolates hex colors natively
  const accent = useTransform(scrollYProgress, [...STOPS], [...COLORS]);

  useEffect(() => {
    document.documentElement.style.setProperty("--zone-accent", COLORS[0]);
  }, []);

  useMotionValueEvent(accent, "change", (color) => {
    document.documentElement.style.setProperty("--zone-accent", color);
  });

  return null;
}
