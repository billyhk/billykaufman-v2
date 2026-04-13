"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useAnimationControls,
  useMotionValueEvent,
  useMotionValue,
  animate,
  type MotionValue,
} from "framer-motion";
import { experienceData, type ExperienceEntry } from "@/data/experience";
import { DARK_LOGO_BG } from "@/constants/colors";

const N = experienceData.length;
const EASE = [0.25, 0.1, 0.25, 1] as const;
const SCALE_Y_MAX = 0.92; // matches the scaleY useTransform range

// ── Card content ──────────────────────────────────────────────────────────────

function CardContent({ entry }: { entry: ExperienceEntry }) {
  return (
    <div
      className="rounded-2xl p-4 border border-white/10 backdrop-blur-sm"
      style={{ backgroundColor: `${entry.accentColor}12` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
        <div>
          <p className="text-white font-bold">{entry.title}</p>
          <p className="text-white/60 text-sm">{entry.institutionName}</p>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap self-start"
          style={{ borderColor: `${entry.accentColor}60`, color: entry.accentColor, backgroundColor: `${entry.accentColor}15` }}
        >
          {entry.dateRange}
        </span>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-1">{entry.description1}</p>
      {entry.description2 && <p className="text-white/50 text-sm leading-relaxed">{entry.description2}</p>}
      {entry.link && (
        <a
          href={entry.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-medium underline underline-offset-2 transition-colors"
          style={{ color: entry.accentColor }}
        >
          {entry.link.label} ↗
        </a>
      )}
    </div>
  );
}

// ── Timeline row ──────────────────────────────────────────────────────────────

function TimelineRow({
  entry,
  index,
  sectionProgress,
  onEnter,
  onExit,
}: {
  entry: ExperienceEntry;
  index: number;
  sectionProgress: MotionValue<number>;
  onEnter?: () => void;
  onExit?: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // Initial estimate so the transform function has something before measurement
  const thresholdRef = useRef(0.04 + (index / N) * 0.80);

  useEffect(() => {
    const row = rowRef.current;
    const container = row?.offsetParent as HTMLElement | null;
    if (!row || !container) return;
    // Trigger when line tip reaches the TOP of the node (not center)
    thresholdRef.current = (row.offsetTop / container.offsetHeight) * SCALE_Y_MAX;
  }, []);

  const dotControls    = useAnimationControls();
  const branchControls = useAnimationControls();
  const cardControls   = useAnimationControls();

  // Step MotionValue: reads thresholdRef on every change, so post-measurement value is used
  const triggered = useTransform(sectionProgress, (v) => (v >= thresholdRef.current ? 1 : 0));

  useMotionValueEvent(triggered, "change", (latest) => {
    if (latest === 1) {
      onEnter?.();
      // Line arrived — animate in (time-based, not scroll-tied)
      dotControls.start({
        scale: 1, rotate: 0, opacity: 1, y: 0,
        transition: { type: "spring", stiffness: 280, damping: 18 },
      });
      branchControls.start({
        scaleX: 1,
        transition: { duration: 0.25, delay: 0.2, ease: EASE },
      });
      cardControls.start({
        clipPath: "inset(0 0% 0 0 round 16px)", opacity: 1,
        transition: { duration: 0.5, delay: 0.3, ease: EASE },
      });
    } else {
      onExit?.();
      // Line retreated — reverse in order: card → branch → dot
      cardControls.start({
        clipPath: "inset(0 100% 0 0 round 16px)", opacity: 0,
        transition: { duration: 0.25, ease: EASE },
      });
      branchControls.start({
        scaleX: 0,
        transition: { duration: 0.18, delay: 0.1, ease: EASE },
      });
      dotControls.start({
        scale: 0.3, rotate: -90, opacity: 0, y: -16,
        transition: { type: "spring", stiffness: 280, damping: 18, delay: 0.2 },
      });
    }
  });

  return (
    <div ref={rowRef} className="flex items-start">
      {/* Node — time-based spring, triggered by line */}
      <motion.div
        className="shrink-0 w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center z-10 backdrop-blur-sm"
        style={{ backgroundColor: entry.logoBg ?? DARK_LOGO_BG }}
        initial={{ scale: 0.3, rotate: -90, opacity: 0, y: -16 }}
        animate={dotControls}
      >
        {entry.logoSrc ? (
          <Image
            src={entry.logoSrc}
            alt={entry.institutionName}
            width={40}
            height={40}
            priority={index < 4}
            className={`w-full h-full ${entry.logoFit === "contain" ? "object-contain" : "object-cover"} ${entry.logoPadding ?? ""}`}
          />
        ) : (
          <span className="text-xs text-white/40 font-bold">{entry.institutionName.charAt(0)}</span>
        )}
      </motion.div>

      {/* Branch — connects at node vertical center */}
      <motion.div
        className="h-px w-5 bg-white/30 shrink-0 mt-[19px]"
        initial={{ scaleX: 0 }}
        animate={branchControls}
        style={{ transformOrigin: "left center" }}
      />

      {/* Card — wipes in left → right */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ clipPath: "inset(0 100% 0 0 round 16px)", opacity: 0 }}
        animate={cardControls}
      >
        <CardContent entry={entry} />
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ExperienceTimeline() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  // Scroll-driven line
  const scrollScaleY = useTransform(scrollYProgress, [0, 0.92], [0, 1]);
  // Auto-complete value: stays 0 until last node fires, then animates to 1
  const autoScaleY = useMotionValue(0);
  // Line uses whichever is larger — scroll OR auto-complete
  const scaleY = useTransform(
    [scrollScaleY, autoScaleY] as [MotionValue<number>, MotionValue<number>],
    ([s, a]: number[]) => Math.max(s, a)
  );

  const endControls = useAnimationControls();
  const endCapTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleLastNodeEnter = useRef(() => {
    // Auto-complete the line
    animate(autoScaleY, 1, { duration: 0.5, ease: EASE });
    // Show end cap after the card finishes wiping in (0.3s delay + 0.5s wipe)
    endCapTimeout.current = setTimeout(() => {
      endControls.start({
        opacity: 1, scale: 1,
        transition: { type: "spring", stiffness: 220, damping: 16 },
      });
    }, 900);
  }).current;

  const handleLastNodeExit = useRef(() => {
    clearTimeout(endCapTimeout.current);
    animate(autoScaleY, 0, { duration: 0.15 });
    endControls.start({ opacity: 0, scale: 0, transition: { duration: 0.2, ease: EASE } });
  }).current;

  return (
    <div ref={ref} className="relative pb-6">
      <motion.div
        className="absolute left-5 top-0 bottom-0 w-px bg-white/20 origin-top"
        style={{ scaleY }}
      />

      <div className="space-y-5">
        {experienceData.map((entry, i) => (
          <TimelineRow
            key={entry.institutionName}
            entry={entry}
            index={i}
            sectionProgress={scrollYProgress}
            onEnter={i === N - 1 ? handleLastNodeEnter : undefined}
            onExit={i === N - 1 ? handleLastNodeExit : undefined}
          />
        ))}
      </div>

      {/* End-of-timeline cap — centered on line tip */}
      <motion.div
        className="absolute left-5 flex items-center justify-center w-5 h-5"
        style={{ bottom: -10, x: "-50%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={endControls}
      >
        {/* Expanding ripple ring */}
        <motion.div
          className="absolute w-5 h-5 rounded-full border border-white/30"
          animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 0.3 }}
        />
        {/* Second ripple, offset */}
        <motion.div
          className="absolute w-5 h-5 rounded-full border border-white/20"
          animate={{ scale: [1, 2.4], opacity: [0.3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 0.3, delay: 0.7 }}
        />
        {/* Core dot */}
        <div className="w-2 h-2 rounded-full bg-white/70" />
      </motion.div>
    </div>
  );
}
