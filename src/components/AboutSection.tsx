"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { bioData } from "@/data/bio";
import ResumeButton from "@/components/ResumeButton";
import SectionHeading from "@/components/SectionHeading";

const EASE = [0.25, 0.1, 0.25, 1] as const;

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <DepthSection id="about">
      <DepthLabel depth="~50m" />

      <SectionHeading title="About Me" subtitle={bioData.title} />

      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 space-y-4">

          <FadeUp delay={0.05}>
            <div className="flex flex-wrap gap-2 py-1">
              {bioData.highlights.map((label) => (
                <span key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/6 border border-white/12 text-white/70">
                  {label}
                </span>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p className="text-white/75 leading-relaxed">{bioData.paragraphs[0]}</p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-white/75 leading-relaxed">
              {bioData.paragraphs[1].split("General Assembly")[0]}
              <a href={bioData.generalAssemblyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline underline-offset-2">
                General Assembly
              </a>
              {bioData.paragraphs[1].split("General Assembly")[1]}
            </p>
          </FadeUp>

          <FadeUp delay={0.28}>
            <p className="text-white/75 leading-relaxed">{bioData.paragraphs[2]}</p>
          </FadeUp>

          <FadeUp delay={0.36}>
            <p className="text-white/75 leading-relaxed">{bioData.paragraphs[3]}</p>
          </FadeUp>

          <FadeUp delay={0.44}>
            <div className="flex flex-wrap gap-3 pt-2">
              <ResumeButton />
              <a href="mailto:billyhkaufman@gmail.com" className="clip-bl px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-colors text-sm">
                Hire Me
              </a>
            </div>
          </FadeUp>
        </div>

        <motion.div
          className="relative self-start shrink-0"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
        >
          <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-blue-400/20 to-purple-400/20 blur-md" />
          <div className="relative">
            <Image
              src={bioData.headshotSrc}
              alt="Headshot of Billy Kaufman"
              width={360}
              height={360}
              style={{ height: "auto" }}
              priority
              className="rounded-2xl object-cover shadow-xl ring-1 ring-white/15 opacity-90"
            />
            <div className="absolute inset-0 rounded-2xl bg-blue-950/25 mix-blend-multiply pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </DepthSection>
  );
}
