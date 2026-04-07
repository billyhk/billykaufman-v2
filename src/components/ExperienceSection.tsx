import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import ExperienceTimeline from "@/components/ExperienceTimeline";

export default function ExperienceSection() {
  return (
    <DepthSection id="experience">
      <DepthLabel depth="~200m" />
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Experience</h2>
      <p className="text-blue-300 text-lg mb-10">My journey so far</p>
      <ExperienceTimeline />
    </DepthSection>
  );
}
