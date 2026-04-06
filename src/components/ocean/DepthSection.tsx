"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DepthSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function DepthSection({ id, children, className = "" }: DepthSectionProps) {
  return (
    <section
      id={id}
      className={`relative min-h-screen flex items-center justify-center px-6 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-5xl mx-auto"
      >
        {children}
      </motion.div>
    </section>
  );
}
