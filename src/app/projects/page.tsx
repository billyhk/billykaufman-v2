import ProjectsGallery from "@/components/ProjectsGallery";

export const metadata = {
  title: "Projects — Billy Kaufman",
};

export default function ProjectsPage() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Projects</h1>
        <p className="text-blue-300 mt-1 text-lg">Things I&apos;ve built</p>
      </div>
      <ProjectsGallery />
    </main>
  );
}
