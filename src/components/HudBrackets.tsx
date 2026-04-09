"use client";

import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;
const ARM      = 28; // px — arm length
const SIDE     = 18; // px — left/right inset from viewport edges
const NAV_H    = 64; // px — nav height; top brackets sit here, joining nav bottom to HUD frame
const BTM_INSET = 18; // px — bottom brackets inset from viewport bottom

const ARM_STYLE = { backgroundColor: "var(--zone-accent)", opacity: 0.28 } as const;
const DOT_STYLE = { backgroundColor: "var(--zone-accent)", opacity: 0.45 } as const;


function Corner({
  topPx, bottomPx, left, right, delay = 0, noHArm = false,
}: {
  topPx?: number; bottomPx?: number; left?: boolean; right?: boolean;
  delay?: number; noHArm?: boolean;
}) {
  const isTop = topPx !== undefined;
  return (
    <motion.div
      className="absolute"
      style={{
        top:    topPx    !== undefined ? topPx    : undefined,
        bottom: bottomPx !== undefined ? bottomPx : undefined,
        left:   left  ? SIDE : undefined,
        right:  right ? SIDE : undefined,
      }}
      animate={{ opacity: [0.55, 0.9, 0.55] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay * 0.4 }}
    >
      {/* Corner dot */}
      <motion.div
        className="absolute w-1 h-1 rounded-full"
        style={{
          ...DOT_STYLE,
          top:    isTop  ? -0.5 : undefined,
          bottom: !isTop ? -0.5 : undefined,
          left:   left   ? -0.5 : undefined,
          right:  right  ? -0.5 : undefined,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: DOT_STYLE.opacity }}
        transition={{ duration: 0.25, delay: delay + 0.28, ease: EASE }}
      />

      {/* Horizontal arm — omitted for top brackets (nav bottom border serves this role) */}
      {!noHArm && (
        <motion.div
          className="absolute h-px"
          style={{
            ...ARM_STYLE,
            width: ARM,
            top:    isTop  ? 0 : undefined,
            bottom: !isTop ? 0 : undefined,
            left:   left   ? 0 : undefined,
            right:  right  ? 0 : undefined,
            transformOrigin: left ? "left center" : "right center",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.45, delay, ease: EASE }}
        />
      )}

      {/* Vertical arm */}
      <motion.div
        className="absolute w-px"
        style={{
          ...ARM_STYLE,
          height: ARM,
          top:    isTop  ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left:   left   ? 0 : undefined,
          right:  right  ? 0 : undefined,
          transformOrigin: isTop ? "top center" : "bottom center",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.45, delay: delay + 0.1, ease: EASE }}
      />
    </motion.div>
  );
}

export default function HudBrackets() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden">
      {/* Top brackets: nav border is the H-arm, so only dot + V-arm needed */}
      <Corner topPx={NAV_H}    left  delay={0} noHArm />
      <Corner topPx={NAV_H}    right delay={0} noHArm />
      {/* Bottom brackets stay at viewport corners */}
      <Corner bottomPx={BTM_INSET} left  delay={0} />
      <Corner bottomPx={BTM_INSET} right delay={0} />

    </div>
  );
}
