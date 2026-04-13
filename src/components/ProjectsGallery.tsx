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
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
} from "framer-motion";
import { BloombergLogo } from "./ClientLogos";
import Modal from "./Modal";

const N = projectsData.length;
const NAV_H = 64;
const ITEM_H = 40; // px — height of each compact (non-active) list row
const PILL_CLS = "text-xs px-2.5 py-1 bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/20";

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

  // Track cursor anywhere on the viewport and tilt the screen toward it.
  // Always keep tiltTransform wired to the motion.div — MotionValues must be
  // subscribed from the first render. Straightening on mobile is done by zeroing
  // the values, not by removing the style prop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const applyBase = (desktop: boolean) => {
      tiltX.set(desktop ? TILT_BASE.x : 0);
      tiltY.set(desktop ? TILT_BASE.y : 0);
    };
    applyBase(mq.matches);

    const onMove = (e: MouseEvent) => {
      if (!mq.matches) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tiltY.set(TILT_BASE.y + nx * 5);
      tiltX.set(TILT_BASE.x - ny * 4);
    };

    const onMqChange = (e: MediaQueryListEvent) => applyBase(e.matches);

    window.addEventListener("mousemove", onMove, { passive: true });
    mq.addEventListener("change", onMqChange);
    return () => {
      window.removeEventListener("mousemove", onMove);
      mq.removeEventListener("change", onMqChange);
    };
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
  const [descModal, setDescModal] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const [sectionDone, setSectionDone] = useState(false);
  // Refs used by the scroll listener and resize handler — declared first to avoid
  // forward-reference confusion even though closures capture them by identity.
  const activeIdxRef = useRef(0);
  const isResizing   = useRef(false);

  // Single listener: tracks active project and section-done flag.
  // Maps scrollYProgress [0,1] → [0,N) via Math.floor(v * (N - 0.0001)).
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (isResizing.current) return; // freeze during resize — handler restores position
    setSectionDone(v >= 0.999);
    const next = Math.floor(v * (N - 0.0001));
    activeIdxRef.current = next;
    setActiveIdx((prev) => {
      if (prev === next) return prev;
      setImageIdx(0);
      return next;
    });
  });

  useEffect(() => { setDescModal(false); }, [activeIdx]);

  const project = projectsData[activeIdx];

  const handlePrev = () => setImageIdx((i) => (i === 0 ? project.images.length - 1 : i - 1));
  const handleNext = () => setImageIdx((i) => (i === project.images.length - 1 ? 0 : i + 1));

  // Scroll to idx + 0.4 within its scroll band (midpoint avoids boundary rounding issues).
  const scrollToProject = (idx: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const h = el.offsetHeight;
    const target = top + ((idx + 0.4) / N) * Math.max(h - window.innerHeight, 0);
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  // On resize, scrollYProgress recalculates (viewport height changed) which can shift
  // activeIdx. Capture the active project at resize start and restore it once settled.
  useEffect(() => {
    const resizeTarget = { idx: -1 };
    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      if (resizeTarget.idx === -1) resizeTarget.idx = activeIdxRef.current;
      isResizing.current = true; // freeze activeIdx while viewport is changing
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const el = sectionRef.current;
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          const h = el.offsetHeight;
          const target = top + ((resizeTarget.idx + 0.4) / N) * Math.max(h - window.innerHeight, 0);
          window.scrollTo({ top: Math.max(0, target), behavior: "instant" });
        }
        resizeTarget.idx = -1;
        isResizing.current = false; // resume normal scroll tracking
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(timeout); };
  }, []); // empty deps — only refs (sectionRef, activeIdxRef) and constant N


  return (
    <div ref={sectionRef} style={{ height: `${N * 80}vh` }}>
      {/* ── Sticky panel ── */}
      <div
        className="sticky flex items-center overflow-hidden"
        style={{ top: NAV_H, height: `calc(100svh - ${NAV_H}px)` }}
      >
        {/* Inner panel — capped at 900px so tall viewports don't stretch the layout */}
        <div
          className="relative flex flex-col md:flex-row w-full overflow-hidden"
          style={{ height: `min(calc(100svh - ${NAV_H}px), 900px)` }}
        >

        {/* Scroll progress bar — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 z-20 overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 bottom-0 opacity-50"
            style={{ background: "var(--zone-accent)", scaleY: springProgress, transformOrigin: "top" }}
          />
        </div>

        {/* ── LEFT: HUD Screen ── */}
        {/* max-h-[52%] on mobile caps the HUD so the info panel always gets the rest of the viewport */}
        <div className="md:w-[55%] max-h-[52%] md:max-h-none flex items-start md:items-center justify-center p-4 md:p-10 md:pl-8 shrink-0 overflow-hidden">
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

        {/* ── RIGHT: Unified project list — active item expands with full info ── */}
        <div className="flex-1 flex flex-col px-6 md:px-8 pt-4 pb-6 md:py-10 border-t md:border-t-0 md:border-l border-white/8 overflow-hidden">
          {/* List scrolls so active item is always at the top */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <motion.div
              animate={{ y: -activeIdx * ITEM_H }}
              transition={{ type: "spring", stiffness: 280, damping: 38, mass: 0.8 }}
            >
              {projectsData.map((p, i) => {
                const dist = Math.abs(i - activeIdx);
                const isActive = i === activeIdx;
                const rowOpacity = isActive ? 1 : dist === 1 ? 0.5 : 0.18;
                const counter = String(i + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");

                return (
                  <motion.div
                    key={p.key}
                    animate={{ opacity: rowOpacity }}
                    transition={{ duration: 0.3 }}
                  >
                    {isActive ? (
                      /* Expanded active item */
                      <div className="pb-5">
                        <p className="font-mono text-xs tracking-widest mb-2" style={{ color: "var(--zone-accent)", opacity: 0.6 }}>
                          {counter}
                        </p>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight">{p.title}</h3>
                          <div className="flex gap-3 shrink-0">
                            {p.sourceCode && (
                              <a href={p.sourceCode} target="_blank" rel="noopener noreferrer"
                                className="text-white/40 hover:text-white transition-colors" aria-label="Source code">
                                <FaGithub size={18} />
                              </a>
                            )}
                            {p.deployment && (
                              <a href={p.deployment} target="_blank" rel="noopener noreferrer"
                                className="text-white/40 hover:text-white transition-colors" aria-label="Live site">
                                <FaExternalLinkAlt size={15} />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-3" style={{ color: "var(--zone-accent)" }}>{p.client}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {p.technologies.slice(0, 3).map((tech) => (
                            <span key={tech} className={PILL_CLS}>{tech}</span>
                          ))}
                          {p.technologies.length > 3 && (
                            <span className="text-xs px-2.5 py-1 bg-white/5 text-white/40 rounded-full border border-white/10">
                              +{p.technologies.length - 3}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setDescModal(true)}
                          className="text-xs font-semibold tracking-wide"
                          style={{ color: "var(--zone-accent)", cursor: "pointer" }}
                        >
                          Read more ↗
                        </button>
                      </div>
                    ) : (
                      /* Compact non-active row */
                      <button
                        type="button"
                        style={{ height: ITEM_H, cursor: "pointer" }}
                        onClick={() => scrollToProject(i)}
                        className="flex w-full items-center gap-2.5 select-none text-left"
                        aria-label={`Go to project ${i + 1}: ${p.title}`}
                      >
                        <span className="font-mono text-[10px] tabular-nums shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-tight truncate text-white/60 font-medium">{p.title}</span>
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        </div>{/* end inner panel */}
      </div>

      {/* ── Mobile scroll hint — visible on first project until user scrolls ── */}
      <AnimatePresence>
        {!sectionDone && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 md:hidden pointer-events-none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: [0, -5, 0] }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.4, delay: 0.6, y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 } }}
          >
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: "var(--zone-accent)", opacity: 0.5 }}>
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

      {/* ── Description modal ── */}
      <Modal isOpen={descModal} onClose={() => setDescModal(false)}>
        <div
          className="w-full max-w-sm max-h-[70vh] flex flex-col rounded-xl overflow-hidden"
          style={{
            background: "color-mix(in srgb, var(--zone-accent) 6%, #020c18)",
            border: "1px solid color-mix(in srgb, var(--zone-accent) 25%, transparent)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ borderBottom: "1px solid color-mix(in srgb, var(--zone-accent) 18%, transparent)" }}
          >
            <span className="text-white font-semibold text-sm">{project.title}</span>
            <button
              onClick={() => setDescModal(false)}
              className="text-white/40 hover:text-white transition-colors text-lg leading-none"
              style={{ cursor: "pointer" }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4 space-y-4">
            <p className="text-white/70 text-sm leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className={PILL_CLS}>{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
