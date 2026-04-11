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
      <main className="relative z-10" style={{ overflowX: "clip" }}>
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
