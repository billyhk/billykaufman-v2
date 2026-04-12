import { OceanCanvas } from "@/components/ClientOnly";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ClientsMarquee from "@/components/ClientsMarquee";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";

export default function HomePage() {
  return (
    <>
      <OceanCanvas />
      {/* FIX C: overflow-x was changed from "hidden" (creates scroll container) to "clip"
           (does not create scroll container, so browser won't treat <main> as a horizontal
           scrollable region). Swap the className back to overflow-x-hidden to reproduce. */}
      <main className="relative z-10 overflow-x-hidden" /* style={{ overflowX: "clip" }} */>
        <HeroSection />
        <AboutSection />
        <ClientsMarquee />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
      </main>
    </>
  );
}
