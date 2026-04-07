"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { experienceData } from "@/data/experience";
import { DARK_LOGO_BG } from "@/constants/colors";

export default function ExperienceTimeline() {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
      <div className="space-y-5">
        {experienceData.map((entry, i) => (
          <motion.div
            key={entry.institutionName}
            className="flex gap-6"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
          >
            <div
              className="shrink-0 w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center z-10 backdrop-blur-sm"
              style={{ backgroundColor: entry.logoBg ?? DARK_LOGO_BG }}
            >
              {entry.logoSrc ? (
                <Image
                  src={entry.logoSrc}
                  alt={entry.institutionName}
                  width={40}
                  height={40}
                  className={`w-full h-full ${entry.logoFit === "contain" ? "object-contain" : "object-cover"} ${entry.logoPadding ?? ""}`}
                />
              ) : (
                <span className="text-xs text-white/40 font-bold">{entry.institutionName.charAt(0)}</span>
              )}
            </div>

            <div
              className="flex-1 rounded-2xl p-4 border border-white/10 backdrop-blur-sm"
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
