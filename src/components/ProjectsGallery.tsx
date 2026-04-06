"use client";

import Image from "next/image";
import { useState } from "react";
import { projectsData, type Project } from "@/data/projects";
import { FaGithub, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
          <Image
            src={images[idx]}
            alt={`${title} screenshot ${idx + 1}`}
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Previous image"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Next image"
          >
            <FaChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === idx ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <ImageCarousel images={project.images} title={project.title} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-white font-bold text-xl">{project.title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            {project.sourceCode && (
              <a
                href={project.sourceCode}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Source code"
              >
                <FaGithub size={18} />
              </a>
            )}
            {project.deployment && (
              <a
                href={project.deployment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Live site"
              >
                <FaExternalLinkAlt size={16} />
              </a>
            )}
          </div>
        </div>
        <p className="text-blue-300 text-sm mb-3">{project.client}</p>
        <p className="text-white/70 text-sm leading-relaxed mb-4 flex-1">
          {project.description}
        </p>
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
      </div>
    </div>
  );
}

export default function ProjectsGallery() {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = selected
    ? projectsData.filter((p) => p.key === selected)
    : projectsData;

  return (
    <div>
      {/* Filter dropdown */}
      <div className="flex items-center gap-3 mb-8">
        <label className="text-white/50 text-sm" htmlFor="project-filter">
          Filter:
        </label>
        <select
          id="project-filter"
          value={selected ?? ""}
          onChange={(e) => setSelected(e.target.value || null)}
          className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Projects</option>
          {projectsData.map((p) => (
            <option key={p.key} value={p.key}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className={`grid gap-8 ${filtered.length === 1 ? "grid-cols-1 max-w-2xl mx-auto w-full" : "grid-cols-1 lg:grid-cols-2"}`}>
        {filtered.map((project) => (
          <ProjectCard key={project.key} project={project} />
        ))}
      </div>
    </div>
  );
}
