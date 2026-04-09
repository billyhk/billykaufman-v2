import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { ProjectsGallery } from "@/components/ClientOnly";
import SectionHeading from "@/components/SectionHeading";

export default function ProjectsSection() {
  return (
    <DepthSection id="projects">
      <DepthLabel depth="~500m" />
      <SectionHeading title="Projects" subtitle="Things I've built" />
      <ProjectsGallery />
    </DepthSection>
  );
}
