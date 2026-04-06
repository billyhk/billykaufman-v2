"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { socialLinks } from "@/data/social";
import { RESUME_URL } from "@/data/bio";

const TITLES = [
  "Software Engineer",
  "Full-Stack Developer",
  "React Specialist",
  "TypeScript Enthusiast",
  "Amateur Distance Runner",
  "Puzzled Chess Player",
  "Symphonic Drum Beater 🥁",
];

function TypingTitle() {
  const [titleIdx, setTitleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = TITLES[titleIdx];
    const done = displayed.length === current.length;
    const empty = displayed.length === 0;

    if (deleting && empty) {
      setDeleting(false);
      setTitleIdx((i) => (i + 1) % TITLES.length);
      return;
    }

    const phase = deleting ? "deleting" : done ? "pausing" : "typing";
    const phases = {
      typing:   { delay: 60,   next: () => setDisplayed(current.slice(0, displayed.length + 1)) },
      pausing:  { delay: 1800, next: () => setDeleting(true) },
      deleting: { delay: 35,   next: () => setDisplayed(displayed.slice(0, -1)) },
    };
    const { delay, next } = phases[phase];
    const timeout = setTimeout(next, delay);
    return () => clearTimeout(timeout);
  }, [displayed, deleting, titleIdx]);

  return (
    <p className="text-lg md:text-xl text-blue-300 font-medium tracking-wide h-8">
      {displayed}
      <span className="animate-pulse">|</span>
    </p>
  );
}

function AnimatedName() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-12, 12]), { stiffness: 100, damping: 20 });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [6, -6]), { stiffness: 100, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <div style={{ perspective: 800 }}>
      <motion.h1
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          fontSize: "clamp(3.5rem, 12vw, 9rem)",
          lineHeight: 1.0,
        } as React.CSSProperties}
        className="name-shimmer font-bold leading-none cursor-default select-none"
      >
        Billy<br />Kaufman
      </motion.h1>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 w-full max-w-5xl px-8 md:px-12"
    >
      <motion.p variants={item} className="text-white/40 text-sm tracking-[0.2em] uppercase mb-3">
        Hi, I&apos;m
      </motion.p>

      <motion.div variants={item} className="mb-5">
        <AnimatedName />
      </motion.div>

      <motion.div variants={item} className="mb-7">
        <TypingTitle />
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-3 mb-7">
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Download Resume
        </a>
        <a
          href="mailto:billyhkaufman@gmail.com"
          className="px-5 py-2.5 bg-white/8 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/15 transition-colors text-sm"
        >
          Hire Me
        </a>
        <Link
          href="#about"
          onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
          className="px-5 py-2.5 bg-white/8 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/15 transition-colors text-sm"
        >
          About Me
        </Link>
      </motion.div>

      <motion.div variants={item} className="flex gap-5">
        {socialLinks.map(({ Icon, href, displayName, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
          >
            <Icon size={18} className="group-hover:text-blue-300 transition-colors" />
            <span className="text-xs hidden md:inline">{displayName}</span>
          </a>
        ))}
      </motion.div>
    </motion.div>
  );
}
