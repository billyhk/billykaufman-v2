import DepthLabel from "@/components/ocean/DepthLabel";
import SectionHeading from "@/components/SectionHeading";
import { ProjectsGallery } from "@/components/ClientOnly";

export default function ProjectsSection() {
  return (
    <section id="projects" className="relative">
      <div className="px-6 md:px-16 pt-24 pb-10 max-w-5xl mx-auto">
        <DepthLabel depth="~500m" />
        <SectionHeading title="Projects" subtitle="Things I've built" />
      </div>
      <ProjectsGallery />
    </section>
  );
}
