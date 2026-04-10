"use client";

import { motion } from "framer-motion";
import DepthLabel from "@/components/ocean/DepthLabel";
import SkillsGrid from "@/components/SkillsGrid";
import ContactFooter from "@/components/ContactFooter";
import GamesSection from "@/components/GamesSection";
import SectionHeading from "@/components/SectionHeading";

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="relative py-24 px-6 md:px-16 overflow-hidden"
    >
      {/*
        Floor grid — the surface the cards are sitting on.
        perspective() + rotateX in the transform creates the receding-floor look.
        Anchored at the bottom so the near edge of the floor is at the bottom
        of the section and the far edge fades into the top (depth fog).
      */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: "-25%",
          right: "-25%",
          height: "70%",
          transform: "perspective(500px) rotateX(55deg)",
          transformOrigin: "center bottom",
          backgroundImage: [
            "linear-gradient(rgba(6,182,212,0.14) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(6,182,212,0.14) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "70px 70px",
          // Far edge of floor fades out (depth fog toward horizon)
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, black 80%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, black 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Cards sitting on the floor */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <DepthLabel depth="~1000m" />
        <SectionHeading title="Skills & Tools" subtitle="What I bring to the table" />
        <SkillsGrid />
        <ContactFooter />
        <GamesSection />
      </motion.div>
    </section>
  );
}
