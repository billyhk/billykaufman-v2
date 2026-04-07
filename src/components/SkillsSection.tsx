"use client";

import { motion, type Variants } from "framer-motion";
import { skillsData } from "@/data/skills";
import { toolsData } from "@/data/tools";
import { ACCENT_BLUE, CAT_BLUE, CAT_GREEN, CAT_ORANGE, CAT_PURPLE, CAT_YELLOW, CAT_CYAN } from "@/constants/colors";

const TOOL_COLORS: Record<string, string> = {
  "IDE":              CAT_BLUE,
  "Version Control":  CAT_GREEN,
  "Project Mgmt":     CAT_ORANGE,
  "Design":           CAT_PURPLE,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Frontend":            CAT_BLUE,
  "Backend":             CAT_GREEN,
  "Cloud & DevOps":      CAT_ORANGE,
  "AI & Modern Tooling": CAT_PURPLE,
  "Testing":             CAT_YELLOW,
  "Documentation":       CAT_CYAN,
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" },
  }),
};

export default function SkillsSection() {
  return (
    <>
      {/* Skill categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {skillsData.map((category, i) => {
          const color = CATEGORY_COLORS[category.heading] ?? ACCENT_BLUE;
          return (
            <motion.div
              key={category.heading}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Colored left accent bar */}
              <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" style={{ backgroundColor: color }} />

              <h3
                className="text-xs font-semibold uppercase tracking-widest mb-3 pl-3"
                style={{ color }}
              >
                {category.heading}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full text-sm font-medium text-white/85 border transition-colors hover:text-white"
                    style={{
                      backgroundColor: `${color}12`,
                      borderColor: `${color}30`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {toolsData.map((tool, i) => {
          const color = TOOL_COLORS[tool.title] ?? ACCENT_BLUE;
          return (
            <motion.div
              key={tool.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 backdrop-blur-sm overflow-hidden relative"
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-4 right-4 h-px" style={{ backgroundColor: color, opacity: 0.4 }} />
              <p className="text-xs uppercase tracking-widest mb-3 mt-1" style={{ color }}>{tool.title}</p>
              <div className="flex flex-col gap-1.5">
                {tool.items.map((item) => (
                  <span key={item} className="text-white/80 text-sm font-medium">{item}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
