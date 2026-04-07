import Image from "next/image";
import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import ClientsGrid from "@/components/ClientsGrid";
import { bioData, RESUME_URL } from "@/data/bio";

export default function AboutSection() {
  return (
    <DepthSection id="about">
      <DepthLabel depth="~50m" />
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">About Me</h2>
          <p className="text-blue-200 text-lg">{bioData.title}</p>

          <div className="flex flex-wrap gap-2 py-1">
            {["NYC", "8+ yrs", "Full-stack"].map((label) => (
              <span key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/6 border border-white/12 text-white/70">
                {label}
              </span>
            ))}
          </div>

          <p className="text-white/75 leading-relaxed">{bioData.paragraphs[0]}</p>
          <p className="text-white/75 leading-relaxed">
            {bioData.paragraphs[1].split("General Assembly")[0]}
            <a href={bioData.generalAssemblyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline underline-offset-2">
              General Assembly
            </a>
            {bioData.paragraphs[1].split("General Assembly")[1]}
          </p>
          <p className="text-white/75 leading-relaxed">{bioData.paragraphs[2]}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="btn-cta px-5 py-2.5 font-semibold rounded-lg text-sm">
              Download Resume
            </a>
            <a href="mailto:billyhkaufman@gmail.com" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors text-sm">
              Hire Me
            </a>
          </div>
        </div>

        <div className="relative self-start shrink-0">
          <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-blue-400/20 to-purple-400/20 blur-md" />
          <div className="relative">
            <Image
              src={bioData.headshotSrc}
              alt="Headshot of Billy Kaufman"
              width={240}
              height={240}
              style={{ height: "auto" }}
              priority
              className="rounded-2xl object-cover shadow-xl ring-1 ring-white/15 opacity-90"
            />
            <div className="absolute inset-0 rounded-2xl bg-blue-950/25 mix-blend-multiply pointer-events-none" />
          </div>
        </div>
      </div>

      <ClientsGrid />
    </DepthSection>
  );
}
