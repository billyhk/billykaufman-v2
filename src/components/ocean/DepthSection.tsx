"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Variant = "default" | "dip-right";

interface DepthSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  variant?: Variant;
}

// Simple entrance animation — no scroll-driven 3D.
// The 3D approach effect lives exclusively in SkillsSection.
export default function DepthSection({ id, children, className = "", variant: _variant = "default" }: DepthSectionProps) {
  return (
    <section
      id={id}
      className={`relative py-24 flex items-center justify-center px-6 md:px-16 ${className}`}
    >
      <motion.div
        className="w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </section>
  );
}
