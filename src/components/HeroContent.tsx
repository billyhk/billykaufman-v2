"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { socialLinks } from "@/data/social";
import { PARTICLE_COLORS } from "@/constants/colors";
import ResumeButton from "@/components/ResumeButton";
import Button from "@/components/Button";

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

    const phase = deleting && empty ? "switching"
      : deleting ? "deleting"
      : done     ? "pausing"
      :             "typing";

    const phases = {
      typing:    { delay: 60,   next: () => setDisplayed(current.slice(0, displayed.length + 1)) },
      pausing:   { delay: 1800, next: () => setDeleting(true) },
      deleting:  { delay: 35,   next: () => setDisplayed(displayed.slice(0, -1)) },
      switching: { delay: 100,  next: () => { setDeleting(false); setTitleIdx((i) => (i + 1) % TITLES.length); } },
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

// ── Particle physics constants ────────────────────────────────────────────────
const SPRING_K  = 0.055;
const DAMPING   = 0.82;
const REPEL_R   = 110;
const REPEL_F   = 7;
const STEP      = 5;   // logical px between samples — controls particle density
const VPAD      = 110; // px — canvas extends this far above/below text so scattered particles don't clip

// Shimmer palette — see constants/colors.ts
const COLORS = PARTICLE_COLORS;

type Particle = {
  x: number; y: number;
  homeX: number; homeY: number;
  vx: number; vy: number;
};

function NameParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particles    = useRef<Particle[]>([]);
  const mouse        = useRef({ x: -9999, y: -9999 });
  const rafId        = useRef(0);

  // Track mouse in canvas-local coordinates
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // During intro lock, ignore real cursor movement (e.isTrusted) but allow
      // synthetic fish-swipe events (e.isTrusted === false) so particles react.
      if (e.isTrusted && document.body.dataset.introLocked) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let alive = true;
    let resizeTimer: ReturnType<typeof setTimeout>;

    const build = () => {
      const container = containerRef.current;
      const canvas    = canvasRef.current;
      if (!container || !canvas) return;

      const dpr        = window.devicePixelRatio || 1;
      // Canvas spans full viewport so particles can scatter beyond the content column.
      // Use clientWidth (excludes scrollbar) to avoid creating horizontal overflow.
      const VW         = document.documentElement.clientWidth;
      // Text starts at the container's left offset from the viewport
      const textOffsetX = container.getBoundingClientRect().left;

      // Match CSS: clamp(3.5rem, 12vw, 9rem) with 16px base
      const contentW = container.offsetWidth;
      const fontSize = Math.max(56, Math.min(contentW * 0.12, 144));
      const lineH    = fontSize * 1.08;
      const H        = lineH * 2 + 12;
      const totalH   = H + VPAD * 2; // canvas taller than text so particles can scatter freely

      canvas.width        = Math.round(VW * dpr);
      canvas.height       = Math.round(totalH * dpr);
      canvas.style.width  = `${VW}px`;
      canvas.style.height = `${totalH}px`;
      // Break out of parent padding to reach viewport left edge
      canvas.style.position = "absolute";
      canvas.style.left     = `-${textOffsetX}px`;
      canvas.style.top      = `-${VPAD}px`; // extend above container
      container.style.height = `${H}px`;   // layout height unchanged

      // Render text to offscreen canvas to sample particle home positions.
      // Text is drawn offset by VPAD so it sits in the centre of the taller canvas.
      const off    = document.createElement("canvas");
      off.width    = canvas.width;
      off.height   = canvas.height;
      const offCtx = off.getContext("2d")!;
      offCtx.scale(dpr, dpr);
      offCtx.font          = `800 ${fontSize}px Raleway, Inter, sans-serif`;
      offCtx.fillStyle     = "#fff";
      offCtx.textBaseline  = "top";
      offCtx.fillText("Billy",   textOffsetX, VPAD);
      offCtx.fillText("Kaufman", textOffsetX, VPAD + lineH);

      const { data } = offCtx.getImageData(0, 0, off.width, off.height);
      const ps: Particle[] = [];

      // Sample in logical px; non-text pixels (alpha=0) are skipped cheaply
      for (let ly = 0; ly < totalH; ly += STEP) {
        for (let lx = 0; lx < VW; lx += STEP) {
          const px = Math.round(lx * dpr);
          const py = Math.round(ly * dpr);
          const i  = (py * off.width + px) * 4;
          if (data[i + 3] > 100) {
            ps.push({ x: lx, y: ly, homeX: lx, homeY: ly, vx: 0, vy: 0 });
          }
        }
      }

      particles.current = ps;
    };

    const scheduleRebuild = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 120);
    };

    const ro = new ResizeObserver(scheduleRebuild);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", scheduleRebuild);

    const animate = () => {
      if (!alive) return;
      const canvas = canvasRef.current;
      if (!canvas) { rafId.current = requestAnimationFrame(animate); return; }

      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      const W   = canvas.width / dpr;
      const mx  = mouse.current.x;
      const my  = mouse.current.y;
      const t   = performance.now() * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Group particles into color bands for batch rendering
      const groups: Particle[][] = COLORS.map(() => []);

      for (const p of particles.current) {
        // Repulsion
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_R && dist > 0) {
          const force = (1 - dist / REPEL_R) * REPEL_F;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring back home
        p.vx += (p.homeX - p.x) * SPRING_K;
        p.vy += (p.homeY - p.y) * SPRING_K;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        // Animated shimmer: color band shifts right over time
        const raw = ((p.homeX / W) * 2 + t * 0.35) % 1;
        const ci  = ((Math.floor(raw * COLORS.length) % COLORS.length) + COLORS.length) % COLORS.length;
        groups[ci].push(p);
      }

      // One fill() call per color = good perf
      for (let c = 0; c < COLORS.length; c++) {
        if (groups[c].length === 0) continue;
        ctx.fillStyle = COLORS[c];
        ctx.beginPath();
        for (const p of groups[c]) {
          ctx.moveTo(p.x + 1.5, p.y);
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      ctx.restore();
      rafId.current = requestAnimationFrame(animate);
    };

    document.fonts.ready.then(() => {
      if (!alive) return;
      build();
      animate();
    });

    return () => {
      alive = false;
      clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <canvas ref={canvasRef} style={{ display: "block", pointerEvents: "none" }} />
      <h1 className="sr-only">Billy Kaufman</h1>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 1.4 } },
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
        {/* Particle canvas — desktop only */}
        <div className="hidden md:block">
          <NameParticles />
        </div>
        {/* Static text — mobile only */}
        <div className="block md:hidden pointer-events-none select-none">
          <h1 className="name-shimmer font-extrabold leading-tight" style={{ fontSize: "clamp(3rem, 16vw, 5rem)", fontFamily: "Raleway, Inter, sans-serif" }}>
            Billy<br />Kaufman
          </h1>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-7">
        <TypingTitle />
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-3 mb-7">
        <ResumeButton />
        <Button variant="secondary" href="mailto:billyhkaufman@gmail.com">
          Hire Me
        </Button>
        <Button
          variant="secondary"
          href="#about"
          onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
        >
          About Me
        </Button>
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
