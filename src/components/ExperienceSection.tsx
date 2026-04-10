import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import SectionHeading from "@/components/SectionHeading";

export default function ExperienceSection() {
  return (
    <DepthSection id="experience" variant="dip-right">
      <DepthLabel depth="~200m" />
      <SectionHeading title="Experience" subtitle="My journey so far" />
      <ExperienceTimeline />
    </DepthSection>
  );
}
