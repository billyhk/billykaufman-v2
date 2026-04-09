"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";

const EASE      = [0.25, 0.1, 0.25, 1] as const;
const ARM       = 28;
const SIDE      = 18;
const NAV_H     = 64;
const BTM_INSET = 18;

const ARM_STYLE = { backgroundColor: "var(--zone-accent)", opacity: 0.28 } as const;
const DOT_STYLE = { backgroundColor: "var(--zone-accent)", opacity: 0.45 } as const;

/**
 * Top bracket: always sits at y=NAV_H.
 * During intro the H-arm is visible (making a full corner); it retracts when the nav arrives.
 */
function TopCorner({ left, right, navReady, noIntro }: {
  left?: boolean; right?: boolean; navReady: boolean; noIntro: boolean;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ top: NAV_H, left: left ? SIDE : undefined, right: right ? SIDE : undefined }}
      animate={{ opacity: [0.55, 0.9, 0.55] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
    >
      {/* Corner dot */}
      <motion.div
        className="absolute w-1 h-1 rounded-full"
        style={{ ...DOT_STYLE, top: -0.5, left: left ? -0.5 : undefined, right: right ? -0.5 : undefined }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: DOT_STYLE.opacity }}
        transition={{ duration: 0.25, delay: noIntro ? 0.88 : 0.2, ease: EASE }}
      />

      {/* H-arm — extends during intro, retracts when nav slides in */}
      <motion.div
        className="absolute h-px"
        style={{
          ...ARM_STYLE,
          width: ARM,
          top: 0,
          left: left ? 0 : undefined,
          right: right ? 0 : undefined,
          transformOrigin: left ? "left center" : "right center",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: noIntro || navReady ? 0 : 1 }}
        transition={{
          scaleX: {
            duration: navReady ? 0.3 : 0.45,
            delay:    navReady ? 0.6 : 0.1,
            ease: EASE,
          },
        }}
      />

      {/* V-arm */}
      <motion.div
        className="absolute w-px"
        style={{
          ...ARM_STYLE,
          height: ARM,
          top: 0,
          left: left ? 0 : undefined,
          right: right ? 0 : undefined,
          transformOrigin: "top center",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.45, delay: noIntro ? 0.78 : 0.1, ease: EASE }}
      />
    </motion.div>
  );
}

/** Bottom bracket — unchanged, always at viewport bottom corners */
function BottomCorner({ left, right, delay = 0 }: { left?: boolean; right?: boolean; delay?: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ bottom: BTM_INSET, left: left ? SIDE : undefined, right: right ? SIDE : undefined }}
      animate={{ opacity: [0.55, 0.9, 0.55] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay * 0.4 }}
    >
      <motion.div
        className="absolute w-1 h-1 rounded-full"
        style={{ ...DOT_STYLE, bottom: -0.5, left: left ? -0.5 : undefined, right: right ? -0.5 : undefined }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: DOT_STYLE.opacity }}
        transition={{ duration: 0.25, delay: delay + 0.28, ease: EASE }}
      />
      <motion.div
        className="absolute h-px"
        style={{ ...ARM_STYLE, width: ARM, bottom: 0, left: left ? 0 : undefined, right: right ? 0 : undefined, transformOrigin: left ? "left center" : "right center" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.45, delay, ease: EASE }}
      />
      <motion.div
        className="absolute w-px"
        style={{ ...ARM_STYLE, height: ARM, bottom: 0, left: left ? 0 : undefined, right: right ? 0 : undefined, transformOrigin: "bottom center" }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.45, delay: delay + 0.1, ease: EASE }}
      />
    </motion.div>
  );
}

export default function HudBrackets() {
  const [noIntro, setNoIntro] = useState(false);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    const ni = window.scrollY > window.innerHeight * 0.5;
    setNoIntro(ni);
    if (ni) { setNavReady(true); return; }
    const t = setTimeout(() => setNavReady(true), INTRO_TOTAL * 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden">
      <TopCorner left  navReady={navReady} noIntro={noIntro} />
      <TopCorner right navReady={navReady} noIntro={noIntro} />
      <BottomCorner left  delay={0} />
      <BottomCorner right delay={0} />
    </div>
  );
}
