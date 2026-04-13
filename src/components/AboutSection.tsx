"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { bioData } from "@/data/bio";
import ResumeButton from "@/components/ResumeButton";
import Button from "@/components/Button";
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

const TILT   = 10;
const SPRING = { stiffness: 260, damping: 28 };

function HeadshotCard() {
  const ref = useRef<HTMLDivElement>(null);

  const rawX   = useMotionValue(0);
  const rawY   = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const rotateX = useSpring(rawX, SPRING);
  const rotateY = useSpring(rawY, SPRING);
  const glare   = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12), transparent 60%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    rawY.set((x - 0.5) *  TILT * 2);
    rawX.set((y - 0.5) * -TILT * 2);
    glareX.set(x * 100);
    glareY.set(y * 100);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      className="relative self-start shrink-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
    >
      {/* Ambient glow behind card — shifts opposite tilt direction for parallax depth */}
      <motion.div
        className="absolute -inset-3 rounded-3xl blur-xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(96,165,250,0.25), rgba(168,85,247,0.15) 60%, transparent 80%)",
          rotateX,
          rotateY,
          transformPerspective: 800,
          scale: 1.05,
        }}
      />
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        className="relative rounded-2xl"
      >
        <Image
          src={bioData.headshotSrc}
          alt="Headshot of Billy Kaufman"
          width={360}
          height={360}
          priority
          className="rounded-2xl object-cover shadow-xl ring-1 ring-white/15 opacity-90 block"
        />
        {/* Colour overlay */}
        <div className="absolute inset-0 rounded-2xl bg-blue-950/20 mix-blend-multiply pointer-events-none" />
        {/* Moving glare — follows cursor like a surface catching light */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: glare }}
        />
      </motion.div>
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
              <Button variant="secondary" href="mailto:billyhkaufman@gmail.com">
                Hire Me
              </Button>
            </div>
          </FadeUp>
        </div>

        <HeadshotCard />
      </div>
    </DepthSection>
  );
}
