"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useScenePhase } from "@/context/ScenePhaseContext";

export default function DiveInButton() {
  const { phase, startDive } = useScenePhase();

  return (
    <AnimatePresence>
      {phase === "surface" && (
        <motion.div
          key="surface-intro"
          className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -24, transition: { duration: 0.6, ease: "easeIn" } }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        >
          {/* Name */}
          <motion.p
            className="text-xs tracking-[0.35em] text-white/50 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            PORTFOLIO
          </motion.p>

          <motion.h1
            className="text-5xl sm:text-7xl font-light tracking-[0.15em] text-white mb-4"
            style={{ fontFamily: "var(--font-raleway)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.9 }}
          >
            BILLY KAUFMAN
          </motion.h1>

          <motion.p
            className="text-xs tracking-[0.3em] text-white/45 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            FULL-STACK ENGINEER · NEW YORK
          </motion.p>

          {/* Dive In button */}
          <motion.button
            className="pointer-events-auto group relative flex flex-col items-center gap-4 cursor-pointer"
            onClick={startDive}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            aria-label="Dive into the experience"
          >
            <span
              className="border border-white/30 px-10 py-3 text-xs tracking-[0.4em] text-white/70
                         group-hover:border-white/60 group-hover:text-white
                         group-hover:bg-white/5 transition-all duration-300"
            >
              DIVE IN
            </span>

            {/* Animated descent arrows */}
            <span className="flex flex-col items-center gap-0.5 overflow-hidden h-8">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="text-white/40 text-xs leading-none"
                  animate={{ y: ["0%", "120%"], opacity: [0, 0.7, 0] }}
                  transition={{
                    duration: 1.4,
                    delay: i * 0.28,
                    repeat: Infinity,
                    ease: "easeIn",
                  }}
                >
                  ↓
                </motion.span>
              ))}
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
