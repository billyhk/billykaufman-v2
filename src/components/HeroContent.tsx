"use client";

import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { socialLinks } from "@/data/social";
import { RESUME_URL } from "@/data/bio";

const TITLES = [
  "Software Engineer",
  "Full-Stack Developer",
  "React Specialist",
  "TypeScript Enthusiast",
];

function RotatingTitle() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % TITLES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h2
          key={idx}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-2xl md:text-3xl text-blue-200 font-medium"
        >
          {TITLES[idx]}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}

function InteractiveName() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-18, 18]), { stiffness: 100, damping: 18 });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [10, -10]), { stiffness: 100, damping: 18 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rawX, rawY]);

  return (
    <div style={{ perspective: 600 }}>
      <motion.h1
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="name-shimmer text-5xl md:text-7xl font-bold leading-tight mb-4 cursor-default select-none"
      >
        Billy Kaufman
      </motion.h1>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 px-6 text-center md:text-left max-w-2xl"
    >
      <motion.p variants={item} className="text-blue-200 text-lg font-medium mb-2 tracking-widest uppercase">
        Hi, I&apos;m
      </motion.p>

      <motion.div variants={item}>
        <InteractiveName />
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <RotatingTitle />
      </motion.div>

      {/* CTAs */}
      <motion.div variants={item} className="flex flex-wrap gap-4 justify-center md:justify-start mb-10">
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          Download Resume
        </a>
        <a
          href="mailto:billyhkaufman@gmail.com"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors backdrop-blur-sm"
        >
          Hire Me
        </a>
        <Link
          href="/about"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors backdrop-blur-sm"
        >
          About Me
        </Link>
      </motion.div>

      {/* Social links */}
      <motion.div variants={item} className="flex flex-wrap gap-6 justify-center md:justify-start">
        {socialLinks.map(({ Icon, href, displayName, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <Icon size={22} className="group-hover:text-blue-300 transition-colors" />
            <span className="text-sm hidden md:inline">{displayName}</span>
          </a>
        ))}
      </motion.div>
    </motion.div>
  );
}
