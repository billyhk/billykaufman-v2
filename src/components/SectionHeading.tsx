"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scroll-driven: starts shifted right, drifts slightly left as you scroll through
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-4%"]);

  return (
    <div ref={ref} className="mb-10">
      {/* Perspective wrapper for 3D fold */}
      <div style={{ perspective: "900px", perspectiveOrigin: "50% 100%" }}>
        <motion.h2
          className="text-[clamp(3rem,8vw,7rem)] font-bold text-white leading-none tracking-tight mb-3"
          // Diagonal fold: rises from floor while sweeping leftward
          initial={{ rotateX: 75, rotateZ: 15, opacity: 0 }}
          whileInView={{ rotateX: 0, rotateZ: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: EASE }}
          style={{ x, transformOrigin: "bottom center" }}
        >
          {title}
        </motion.h2>
      </div>

      <motion.p
        className="text-blue-300 text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        style={{ x }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
