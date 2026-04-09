"use client";

import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;
const ARM   = 28;  // px — arm length
const INSET = 18;  // px — distance from viewport corners

// All color pulled from --zone-accent so it shifts with depth
const ARM_STYLE  = { backgroundColor: "var(--zone-accent)", opacity: 0.28 } as const;
const DOT_STYLE  = { backgroundColor: "var(--zone-accent)", opacity: 0.45 } as const;

function Corner({
  top, bottom, left, right, delay = 0,
}: {
  top?: boolean; bottom?: boolean; left?: boolean; right?: boolean; delay?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        top:    top    ? INSET : undefined,
        bottom: bottom ? INSET : undefined,
        left:   left   ? INSET : undefined,
        right:  right  ? INSET : undefined,
      }}
      animate={{ opacity: [0.55, 0.9, 0.55] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay * 0.4 }}
    >
      {/* Corner dot */}
      <motion.div
        className="absolute w-1 h-1 rounded-full"
        style={{
          ...DOT_STYLE,
          top:    top    ? -0.5 : undefined,
          bottom: bottom ? -0.5 : undefined,
          left:   left   ? -0.5 : undefined,
          right:  right  ? -0.5 : undefined,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: DOT_STYLE.opacity }}
        transition={{ duration: 0.25, delay: 1 + delay + 0.35, ease: EASE }}
      />

      {/* Horizontal arm */}
      <motion.div
        className="absolute h-px"
        style={{
          ...ARM_STYLE,
          width: ARM,
          top:    top    ? 0 : undefined,
          bottom: bottom ? 0 : undefined,
          left:   left   ? 0 : undefined,
          right:  right  ? 0 : undefined,
          transformOrigin: left ? "left center" : "right center",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 1 + delay, ease: EASE }}
      />

      {/* Vertical arm */}
      <motion.div
        className="absolute w-px"
        style={{
          ...ARM_STYLE,
          height: ARM,
          top:    top    ? 0 : undefined,
          bottom: bottom ? 0 : undefined,
          left:   left   ? 0 : undefined,
          right:  right  ? 0 : undefined,
          transformOrigin: top ? "top center" : "bottom center",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 1 + delay + 0.1, ease: EASE }}
      />
    </motion.div>
  );
}

export default function HudBrackets() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      <Corner top    left  delay={0}   />
      <Corner top    right delay={0.5} />
      <Corner bottom left  delay={1}   />
      <Corner bottom right delay={1.5} />
    </div>
  );
}
