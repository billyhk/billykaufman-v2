"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { projectsData, type Project } from "@/data/projects";
import BannerShowcase from "./BannerShowcase";
import { FaGithub, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
} from "framer-motion";
import { BloombergLogo } from "./ClientLogos";

const N = projectsData.length;
const NAV_H = 64;
const ITEM_H = 40; // px — height of each rolling list row (title only, no description)
const VISIBLE = 5; // rows visible in the rolling list

// ── Corner bracket decorations ─────────────────────────────────────────────────
function ScreenBrackets() {
  const c = "var(--zone-accent)";
  const base: React.CSSProperties = { position: "absolute", opacity: 0.55, pointerEvents: "none" };
  const s = 18;
  const w = 1.5;
  return (
    <>
      <svg style={{ ...base, top: -9, left: -9 }} width={s} height={s} viewBox="0 0 18 18">
        <path d="M0 12 L0 0 L12 0" fill="none" stroke={c} strokeWidth={w} />
      </svg>
      <svg style={{ ...base, top: -9, right: -9 }} width={s} height={s} viewBox="0 0 18 18">
        <path d="M18 12 L18 0 L6 0" fill="none" stroke={c} strokeWidth={w} />
      </svg>
      <svg style={{ ...base, bottom: -9, left: -9 }} width={s} height={s} viewBox="0 0 18 18">
        <path d="M0 6 L0 18 L12 18" fill="none" stroke={c} strokeWidth={w} />
      </svg>
      <svg style={{ ...base, bottom: -9, right: -9 }} width={s} height={s} viewBox="0 0 18 18">
        <path d="M18 6 L18 18 L6 18" fill="none" stroke={c} strokeWidth={w} />
      </svg>
    </>
  );
}

// ── HUD terminal screen ────────────────────────────────────────────────────────
interface HudScreenProps {
  project: Project;
  imageIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onImageChange: (i: number) => void;
}

// Base desktop tilt — leans the screen toward the info/list panel on the right
const TILT_BASE = { x: 4, y: 8 };

function HudScreen({ project, imageIdx, onPrev, onNext, onImageChange }: HudScreenProps) {
  const hasImages = project.images.length > 0;
  const hasMultiple = project.images.length > 1;

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 280, damping: 22 });
  const springY = useSpring(tiltY, { stiffness: 280, damping: 22 });
  const tiltTransform = useMotionTemplate`perspective(900px) rotateY(${springY}deg) rotateX(${springX}deg) translateY(-6px)`;

  // Track cursor anywhere on the viewport and tilt the screen toward it
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) return;

    tiltX.set(TILT_BASE.x);
    tiltY.set(TILT_BASE.y);

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;   // -1 … 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tiltY.set(TILT_BASE.y + nx * 5);
      tiltX.set(TILT_BASE.x - ny * 4);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [tiltX, tiltY]);

  return (
    <motion.div
      className="relative mx-auto w-full"
      style={{ maxWidth: 640, cursor: "default", transform: tiltTransform }}
    >
      {/* Screen frame */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "4px 20px 8px 6px",
          border: "1px solid color-mix(in srgb, var(--zone-accent) 38%, transparent)",
          boxShadow: [
            // Accent glow
            "0 0 48px color-mix(in srgb, var(--zone-accent) 16%, transparent)",
            "0 0 0 1px color-mix(in srgb, var(--zone-accent) 8%, transparent)",
            // Inner depth
            "inset 0 0 32px rgba(0,0,4,0.7)",
            // Elevation shadows — simulate lifted surface
            "0 40px 80px -12px rgba(0,0,4,0.95)",
            "0 20px 40px -8px rgba(0,0,0,0.75)",
            "0 8px 16px -2px rgba(0,0,0,0.5)",
          ].join(", "),
        }}
      >
        {/* Media — only this transitions between projects / images */}
        {project.banners ? (
          <BannerShowcase banners={project.banners} />
        ) : (
          <div className="relative aspect-video bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${project.key}-${imageIdx}`}
                className="absolute inset-0"
                initial={{ opacity: 0, filter: "brightness(1.8)" }}
                animate={{ opacity: 1, filter: "brightness(1)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {hasImages ? (
                  <Image
                    src={project.images[imageIdx]}
                    alt={`${project.title} screenshot ${imageIdx + 1}`}
                    fill
                    className="object-cover opacity-90"
                    sizes="(max-width: 768px) 100vw, 55vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-950 to-indigo-950">
                    <BloombergLogo className="w-40 max-h-10 object-contain opacity-50" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
              }}
            />
            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,4,0.55) 100%)" }}
            />

            {/* Image navigation (multi-image projects only) */}
            {hasMultiple && (
              <>
                <button
                  onClick={onPrev}
                  className="absolute left-2 bottom-2 z-20 p-1.5 rounded bg-black/50 hover:bg-black/70 text-white/50 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <FaChevronLeft size={11} />
                </button>
                <button
                  onClick={onNext}
                  className="absolute right-2 bottom-2 z-20 p-1.5 rounded bg-black/50 hover:bg-black/70 text-white/50 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <FaChevronRight size={11} />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                  {project.images.map((_, di) => (
                    <button
                      key={di}
                      onClick={() => onImageChange(di)}
                      className="w-1 h-1 rounded-full transition-colors cursor-pointer"
                      style={{ background: di === imageIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)" }}
                      aria-label={`Image ${di + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Status bar */}
        <div
          className="flex items-center gap-3 px-3 py-1.5 text-[10px] font-mono shrink-0"
          style={{
            background: "color-mix(in srgb, var(--zone-accent) 5%, #000408)",
            borderTop: "1px solid color-mix(in srgb, var(--zone-accent) 18%, transparent)",
          }}
        >
          <span className="opacity-50" style={{ color: "var(--zone-accent)" }}>◈ SYS.DISPLAY</span>
          <span className="text-white/25 uppercase tracking-widest">{project.key.replace(/_/g, ".")}</span>
          <span className="ml-auto text-white/20 tracking-widest">VISUAL.OUT</span>
        </div>
      </div>

      <ScreenBrackets />
    </motion.div>
  );
}

// ── Main gallery ───────────────────────────────────────────────────────────────
export default function ProjectsGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rawIdx = useTransform(scrollYProgress, [0, 1], [0, N - 0.0001]);

  useMotionValueEvent(rawIdx, "change", (v) => {
    const next = Math.floor(v);
    setActiveIdx((prev) => {
      if (prev === next) return prev;
      setImageIdx(0); // reset image carousel on project change
      return next;
    });
  });

  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const project = projectsData[activeIdx];
  const images = project.images;

  const handlePrev = () => setImageIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const handleNext = () => setImageIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  // Scroll to the midpoint of project `idx`'s scroll range.
  // Targeting the exact boundary (idx/N) lands rawIdx just below idx due to the
  // [0, N-0.0001] transform, so Math.floor gives idx-1. Midpoint is always safe.
  const scrollToProject = (idx: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const h = el.offsetHeight;
    const target = top + ((idx + 0.5) / N) * Math.max(h - window.innerHeight, 0);
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  const counterStr = String(activeIdx + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");

  return (
    <div ref={sectionRef} style={{ height: `${N * 80}vh` }}>
      {/* ── Sticky panel ── */}
      <div
        className="sticky flex flex-col md:flex-row overflow-hidden"
        style={{ top: NAV_H, height: `calc(100svh - ${NAV_H}px)` }}
      >
        {/* Scroll progress bar — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 z-20 overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 bottom-0 opacity-50"
            style={{ background: "var(--zone-accent)", scaleY: springProgress, transformOrigin: "top" }}
          />
        </div>

        {/* ── LEFT: HUD Screen ── */}
        <div className="md:w-[55%] flex items-center justify-center p-6 md:p-10 md:pl-8 shrink-0">
          <div className="w-full">
            <HudScreen
              project={project}
              imageIdx={imageIdx}
              onPrev={handlePrev}
              onNext={handleNext}
              onImageChange={setImageIdx}
            />
          </div>
        </div>

        {/* ── RIGHT: Project info + rolling list ── */}
        <div
          className="flex-1 flex flex-col justify-start md:justify-center px-6 md:px-8 pt-4 pb-6 md:py-10 border-t md:border-t-0 md:border-l border-white/8"
        >
          {/* Info block — animates on project change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={project.key + "-info"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="shrink-0"
            >
              {/* Counter */}
              <p className="font-mono text-xs tracking-widest mb-3" style={{ color: "var(--zone-accent)", opacity: 0.6 }}>
                {counterStr}
              </p>

              {/* Title + links */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight">
                  {project.title}
                </h3>
                <div className="flex gap-3 shrink-0 pt-1">
                  {project.sourceCode && (
                    <a href={project.sourceCode} target="_blank" rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors" aria-label="Source code">
                      <FaGithub size={18} />
                    </a>
                  )}
                  {project.deployment && (
                    <a href={project.deployment} target="_blank" rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors" aria-label="Live site">
                      <FaExternalLinkAlt size={15} />
                    </a>
                  )}
                </div>
              </div>

              {/* Client */}
              <p className="text-sm mb-2" style={{ color: "var(--zone-accent)" }}>
                {project.client}
              </p>

              {/* Description */}
              <p className="text-white/55 text-sm leading-relaxed mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div className="h-px bg-white/8 my-4 shrink-0" />

          {/* Rolling project list */}
          <div
            className="relative overflow-hidden shrink-0"
            style={{ height: ITEM_H * VISIBLE }}
          >
            <motion.div
              animate={{ y: -activeIdx * ITEM_H }}
              transition={{ type: "spring", stiffness: 280, damping: 38, mass: 0.8 }}
            >
              {projectsData.map((p, i) => {
                const dist = Math.abs(i - activeIdx);
                const isActive = i === activeIdx;
                const opacity = isActive ? 1 : dist === 1 ? 0.5 : 0.18;
                return (
                  <motion.div
                    key={p.key}
                    animate={{ opacity }}
                    transition={{ duration: 0.3 }}
                    style={{ height: ITEM_H, cursor: "pointer" }}
                    onClick={() => scrollToProject(i)}
                    className="flex items-center gap-2.5 select-none"
                  >
                    <span
                      className="font-mono text-[10px] tabular-nums shrink-0"
                      style={{ color: isActive ? "var(--zone-accent)" : "rgba(255,255,255,0.35)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-sm leading-tight truncate ${isActive ? "text-white font-semibold" : "text-white/60 font-medium"}`}>
                      {p.title}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
