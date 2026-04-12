"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { projectsData, type Project } from "@/data/projects";
import BannerShowcase from "./BannerShowcase";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { BloombergLogo } from "./ClientLogos";

const N = projectsData.length;
const NAV_H = 64;

// ── Corner bracket decorations for the HUD screen ─────────────────────────────
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
function HudScreen({ project }: { project: Project }) {
  const hasImage = project.images.length > 0;

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 640 }}>
      {/* Screen frame */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "4px 20px 8px 6px",
          border: "1px solid color-mix(in srgb, var(--zone-accent) 38%, transparent)",
          boxShadow: [
            "0 0 48px color-mix(in srgb, var(--zone-accent) 14%, transparent)",
            "0 0 0 1px color-mix(in srgb, var(--zone-accent) 6%, transparent)",
            "inset 0 0 24px rgba(0,0,4,0.6)",
          ].join(", "),
          transform: "perspective(1100px) rotateY(-6deg) rotateX(2deg)",
          transformOrigin: "center center",
        }}
      >
        {/* Media */}
        <div className="relative aspect-video bg-black">
          {hasImage ? (
            <Image
              src={project.images[0]}
              alt={project.title}
              fill
              className="object-cover opacity-90"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-950 to-indigo-950">
              <BloombergLogo className="w-40 max-h-10 object-contain opacity-50" />
            </div>
          )}

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
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,4,0.55) 100%)",
            }}
          />
        </div>

        {/* Status bar */}
        <div
          className="flex items-center gap-3 px-3 py-1.5 text-[10px] font-mono shrink-0"
          style={{
            background: "color-mix(in srgb, var(--zone-accent) 5%, #000408)",
            borderTop: "1px solid color-mix(in srgb, var(--zone-accent) 18%, transparent)",
          }}
        >
          <span className="opacity-50" style={{ color: "var(--zone-accent)" }}>
            ◈ SYS.DISPLAY
          </span>
          <span className="text-white/25 uppercase tracking-widest">
            {project.key.replace(/_/g, ".")}
          </span>
          <span className="ml-auto text-white/20 tracking-widest">VISUAL.OUT</span>
        </div>
      </div>

      {/* Corner bracket decorations */}
      <ScreenBrackets />
    </div>
  );
}

// ── Main gallery ───────────────────────────────────────────────────────────────
export default function ProjectsGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rawIdx = useTransform(scrollYProgress, [0, 1], [0, N - 0.0001]);

  useMotionValueEvent(rawIdx, "change", (v) => {
    const next = Math.floor(v);
    setActiveIdx((prev) => (prev !== next ? next : prev));
  });

  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const project = projectsData[activeIdx];
  const counterStr =
    String(activeIdx + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");

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
            style={{
              background: "var(--zone-accent)",
              scaleY: springProgress,
              transformOrigin: "top",
            }}
          />
        </div>

        {/* ── LEFT: HUD Screen ── */}
        <div className="md:w-[55%] flex items-center justify-center p-6 md:p-10 md:pl-8 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.key + "-screen"}
              className="w-full"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45 }}
            >
              {project.banners ? (
                // Bloomberg: BannerShowcase in place of the HUD screen
                <div
                  className="overflow-hidden"
                  style={{
                    borderRadius: "4px 20px 8px 6px",
                    border: "1px solid color-mix(in srgb, var(--zone-accent) 38%, transparent)",
                    boxShadow: "0 0 48px color-mix(in srgb, var(--zone-accent) 14%, transparent)",
                  }}
                >
                  <BannerShowcase banners={project.banners} />
                </div>
              ) : (
                <HudScreen project={project} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Project info + index ── */}
        <div
          className="flex-1 flex flex-col justify-center overflow-y-auto px-6 md:px-8 pb-6 md:py-10 border-t md:border-t-0 md:border-l border-white/8"
          style={{ scrollbarWidth: "none" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={project.key + "-info"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38 }}
              className="shrink-0"
            >
              {/* Counter */}
              <p className="font-mono text-xs tracking-widest mb-4" style={{ color: "var(--zone-accent)", opacity: 0.6 }}>
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
              <p className="text-sm mb-3" style={{ color: "var(--zone-accent)" }}>
                {project.client}
              </p>

              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">
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
          <div className="h-px bg-white/8 my-5 shrink-0" />

          {/* Project index — inactive items */}
          <div className="flex flex-col gap-0.5 overflow-y-auto shrink-0" style={{ scrollbarWidth: "none" }}>
            {projectsData.map((p, i) => (
              <motion.div
                key={p.key}
                animate={{ opacity: i === activeIdx ? 0 : 0.3 }}
                transition={{ duration: 0.3 }}
                className="py-1"
              >
                <span className="font-mono text-[10px] text-white/40 mr-2 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-white text-xs font-medium">{p.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
