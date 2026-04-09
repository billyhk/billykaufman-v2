"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const SECTIONS = 6;
// Inset must clear the bracket corner (18 px) + gauge panel (20 px)
const INSET = 18 + 20; // px from each viewport edge

function useElapsed() {
  const [elapsed, setElapsed] = useState("T+ 00:00:00");
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, "0");
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      setElapsed(`T+ ${hh}:${mm}:${ss}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return elapsed;
}

export default function HudBottomBar() {
  const elapsed = useElapsed();
  const [waypoint, setWaypoint] = useState(1);

  const { scrollYProgress } = useScroll();
  const wpMV = useTransform(scrollYProgress, [0, 1], [0, SECTIONS - 1]);
  useMotionValueEvent(wpMV, "change", (v) => setWaypoint(Math.round(v) + 1));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none select-none hidden md:block"
      style={{ bottom: "18px" }} // align with HudBrackets BTM_INSET
    >
      <div
        className="flex items-center justify-between"
        style={{ paddingLeft: `${INSET}px`, paddingRight: `${INSET}px`, color: "var(--zone-accent)" }}
      >
        {/* Left — coordinates + mission clock */}
        <div className="flex items-center gap-5 text-[9px] font-mono tracking-[0.22em] uppercase opacity-40">
          <span>38°24.18′N · 028°14.33′E</span>
          <span>{elapsed}</span>
        </div>

        {/* Center — pulsing status */}
        <motion.div
          className="text-[9px] font-mono tracking-[0.3em] uppercase"
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          ◆ SYS NOMINAL
        </motion.div>

        {/* Right — waypoint counter */}
        <div className="text-[9px] font-mono tracking-[0.22em] uppercase opacity-40">
          WAYPOINT&nbsp;
          <span className="opacity-100 tabular-nums" style={{ opacity: 0.7 }}>
            {String(waypoint).padStart(2, "0")} / {String(SECTIONS).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
