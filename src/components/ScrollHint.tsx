"use client";

import { motion, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { useDepthScroll } from "@/context/DepthScrollContext";

export default function ScrollHint() {
  const { scrollYProgress } = useDepthScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setVisible(v < 0.92);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          exit={{ opacity: 0, y: 6 }}
          transition={{
            duration: 0.4,
            delay: 0.6,
            y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
          }}
        >
          <span
            className="text-[9px] font-mono tracking-[0.2em] uppercase"
            style={{ color: "var(--zone-accent)", opacity: 0.5 }}
          >
            scroll
          </span>
          <motion.span
            className="block w-px h-5"
            style={{ background: "linear-gradient(to bottom, var(--zone-accent), transparent)" }}
            animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
