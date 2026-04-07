"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { projectsData, type Project } from "@/data/projects";
import BannerShowcase from "./BannerShowcase";
import { FaGithub, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BloombergLogo } from "./ClientLogos";
import { motion, AnimatePresence } from "framer-motion";

// ── Image carousel ────────────────────────────────────────────────────────────
function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="relative w-full aspect-video bg-black/30 rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0"
        >
          <Image src={images[idx]} alt={`${title} screenshot ${idx + 1}`} fill className="object-cover opacity-85" />
          <div className="absolute inset-0 bg-blue-950/25 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,8,23,0.6) 100%)" }} />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors" aria-label="Previous image">
            <FaChevronLeft size={14} />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors" aria-label="Next image">
            <FaChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} aria-label={`Go to image ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Featured panel ────────────────────────────────────────────────────────────
function FeaturedPanel({ project, onPrev, onNext }: { project: Project; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Media */}
      <div className="flex-shrink-0">
        {project.banners
          ? <BannerShowcase banners={project.banners} />
          : <ImageCarousel images={project.images} title={project.title} />
        }
      </div>

      {/* Details */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-white font-bold text-xl">{project.title}</h3>
          <div className="flex gap-3 flex-shrink-0">
            {project.sourceCode && (
              <a href={project.sourceCode} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label="Source code">
                <FaGithub size={18} />
              </a>
            )}
            {project.deployment && (
              <a href={project.deployment} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors" aria-label="Live site">
                <FaExternalLinkAlt size={16} />
              </a>
            )}
          </div>
        </div>

        <p className="text-blue-300 text-sm mb-3">{project.client}</p>
        <p className="text-white/70 text-sm leading-relaxed mb-4 flex-1">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {project.technologies.map((tech) => (
            <span key={tech} className="text-xs px-2.5 py-1 bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/20">
              {tech}
            </span>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex gap-2 pt-4 border-t border-white/8">
          <button onClick={onPrev} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors cursor-pointer">
            <FaChevronLeft size={11} /> Prev
          </button>
          <button onClick={onNext} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors ml-auto cursor-pointer">
            Next <FaChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Filmstrip item ────────────────────────────────────────────────────────────
function FilmstripItem({ project, active, onClick }: { project: Project; active: boolean; onClick: () => void }) {
  const thumb = project.images[0] ?? null;

  return (
    <button
      onClick={onClick}
      className={`w-full flex-shrink-0 group text-left transition-all duration-200 rounded-xl overflow-hidden border cursor-pointer ${
        active
          ? "border-blue-400/60 bg-white/8 shadow-lg shadow-blue-500/10"
          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
      }`}
    >
      {/* Thumbnail — fixed aspect ratio so all items are same height */}
      <div className="relative w-full bg-black/30 overflow-hidden" style={{ paddingTop: "56.25%" }}>
        <div className="absolute inset-0">
          {thumb ? (
            <Image src={thumb} alt={project.title} fill className={`object-cover transition-opacity duration-200 ${active ? "opacity-90" : "opacity-50 group-hover:opacity-70"}`} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-950 to-indigo-950 px-6">
              {project.key === "bloomberg"
                ? <BloombergLogo className="w-full max-h-8 object-contain opacity-80" />
                : <span className="text-white/20 text-2xl font-bold">{project.client.charAt(0)}</span>
              }
            </div>
          )}
        </div>
        {active && <div className="absolute inset-0 ring-2 ring-inset ring-blue-400/40" />}
      </div>

      {/* Label — fixed height so all items align */}
      <div className="px-3 py-2.5 h-[52px] flex flex-col justify-center">
        <p className={`text-xs font-semibold leading-tight line-clamp-1 transition-colors ${active ? "text-white" : "text-white/55 group-hover:text-white/80"}`}>
          {project.title}
        </p>
        <p className={`text-xs mt-0.5 truncate transition-colors ${active ? "text-blue-300/80" : "text-white/30 group-hover:text-white/45"}`}>
          {project.client}
        </p>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectsGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const total   = projectsData.length;
  const prev    = () => setActiveIdx((i) => (i === 0 ? total - 1 : i - 1));
  const next    = () => setActiveIdx((i) => (i === total - 1 ? 0 : i + 1));
  const project = projectsData[activeIdx];

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    itemRefs.current[activeIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeIdx]);

  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Featured panel ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={project.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <FeaturedPanel project={project} onPrev={prev} onNext={next} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Filmstrip ── */}
      {/* Mobile: horizontal scroll row. Desktop: vertical scrollable column. */}
      <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:w-56 xl:w-64 pb-2 lg:pb-0 lg:max-h-[640px] flex-shrink-0"
        style={{ scrollbarWidth: "none" }}
      >
        {projectsData.map((p, i) => (
          <div key={p.key} ref={el => { itemRefs.current[i] = el; }} className="w-44 lg:w-auto flex-shrink-0">
            <FilmstripItem project={p} active={i === activeIdx} onClick={() => setActiveIdx(i)} />
          </div>
        ))}
      </div>

    </div>
  );
}
