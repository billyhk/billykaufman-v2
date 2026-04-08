import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import SkillsGrid from "@/components/SkillsGrid";
import ContactFooter from "@/components/ContactFooter";
import GamesSection from "@/components/GamesSection";
import SectionHeading from "@/components/SectionHeading";

export default function SkillsSection() {
  return (
    <DepthSection id="skills">
      <DepthLabel depth="~1000m" />
      <SectionHeading title="Skills & Tools" subtitle="What I bring to the table" />

      <SkillsGrid />
      <ContactFooter />
      <GamesSection />
    </DepthSection>
  );
}
