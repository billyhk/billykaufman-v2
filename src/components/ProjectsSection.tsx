import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { ProjectsGallery } from "@/components/ClientOnly";

export default function ProjectsSection() {
  return (
    <DepthSection id="projects">
      <DepthLabel depth="~500m" />
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Projects</h2>
      <p className="text-blue-300 text-lg mb-10">Things I&apos;ve built</p>
      <ProjectsGallery />
    </DepthSection>
  );
}
