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

// GPS drift — last two decimal digits wander slowly
function useFlickerCoords() {
  const [lat, setLat] = useState(18);
  const [lon, setLon] = useState(33);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setLat(v => Math.max(10, Math.min(29, v + Math.round((Math.random() - 0.5) * 4))));
      setLon(v => Math.max(28, Math.min(39, v + Math.round((Math.random() - 0.5) * 4))));
      timer = setTimeout(tick, 1800 + Math.random() * 1200);
    };
    timer = setTimeout(tick, 1800 + Math.random() * 1200);
    return () => clearTimeout(timer);
  }, []);
  return `38°24.${String(lat).padStart(2, "0")}′N · 028°14.${String(lon).padStart(2, "0")}′E`;
}

// Rapidly incrementing hex packet counter
function useHexCounter() {
  const [n, setN] = useState(0); // stable SSR value — randomised on client only
  useEffect(() => {
    setN(Math.floor(Math.random() * 0x1000));
    const id = setInterval(
      () => setN(v => (v + Math.floor(Math.random() * 9) + 1) & 0xffff),
      160,
    );
    return () => clearInterval(id);
  }, []);
  return n.toString(16).toUpperCase().padStart(4, "0");
}

export default function HudBottomBar() {
  const elapsed = useElapsed();
  const coords  = useFlickerCoords();
  const hex     = useHexCounter();
  const [waypoint, setWaypoint] = useState(1);

  const { scrollYProgress } = useScroll();
  const wpMV = useTransform(scrollYProgress, [0, 1], [0, SECTIONS - 1]);
  useMotionValueEvent(wpMV, "change", (v) => setWaypoint(Math.round(v) + 1));

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none select-none hidden md:block"
      style={{ bottom: "18px" }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className="flex items-center justify-between"
        style={{ paddingLeft: `${INSET}px`, paddingRight: `${INSET}px`, color: "var(--zone-accent)" }}
      >
        {/* Left — coordinates (drifting) + mission clock + packet counter */}
        <div className="flex items-center gap-5 text-[9px] font-mono tracking-[0.22em] uppercase opacity-40">
          <span>{coords}</span>
          <span>{elapsed}</span>
          <span>PKT·{hex}</span>
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
    </motion.div>
  );
}
