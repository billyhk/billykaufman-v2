import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import SkillsGrid from "@/components/SkillsGrid";
import ContactFooter from "@/components/ContactFooter";
import GamesSection from "@/components/GamesSection";

export default function SkillsSection() {
  return (
    <DepthSection id="skills">
      <DepthLabel depth="~1000m" />
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Skills & Tools</h2>
      <p className="text-blue-300 text-lg mb-10">What I bring to the table</p>

      <SkillsGrid />
      <ContactFooter />
      <GamesSection />
    </DepthSection>
  );
}
