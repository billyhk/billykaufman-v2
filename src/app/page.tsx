import HeroContent from "@/components/HeroContent";
import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { OceanCanvas, ProjectsGallery } from "@/components/ClientOnly";
import ClientsGrid from "@/components/ClientsGrid";
import { bioData, RESUME_URL } from "@/data/bio";
import { skillsData } from "@/data/skills";
import { toolsData } from "@/data/tools";
import { experienceData } from "@/data/experience";
import Image from "next/image";
import FishEat from "@/components/FishEat";
import SeaFloorHop from "@/components/SeaFloorHop";

export default function HomePage() {
  return (
    <>
      <OceanCanvas />

      <main className="relative z-10">

        {/* ── HERO ─────────────────────────────────────── */}
        <section id="home" className="min-h-screen flex items-center pt-16">
          <HeroContent />
        </section>

        {/* ── ABOUT ────────────────────────────────────── */}
        <DepthSection id="about">
          <DepthLabel depth="~50m" />
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">About Me</h2>
              <p className="text-blue-200 text-lg">{bioData.title}</p>
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
            <div className="relative self-start flex-shrink-0">
              <Image
                src={bioData.headshotSrc}
                alt="Headshot of Billy Kaufman"
                width={240}
                height={240}
                style={{ height: "auto" }}
                priority
              className="rounded-2xl object-cover shadow-xl ring-2 ring-white/10 opacity-85"
              />
              {/* Ocean tint overlay */}
              <div className="absolute inset-0 rounded-2xl bg-blue-950/30 mix-blend-multiply pointer-events-none" />
            </div>
          </div>

          <ClientsGrid />
        </DepthSection>

        {/* ── EXPERIENCE ───────────────────────────────── */}
        <DepthSection id="experience">
          <DepthLabel depth="~200m" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Experience</h2>
          <p className="text-blue-300 text-lg mb-10">My journey so far</p>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-5">
              {experienceData.map((entry) => (
                <div key={entry.institutionName} className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center z-10 backdrop-blur-sm" style={{ backgroundColor: entry.logoBg ?? "rgba(15,23,42,0.8)" }}>
                    {entry.logoSrc ? (
                      <Image
                        src={entry.logoSrc}
                        alt={entry.institutionName}
                        width={40}
                        height={40}
                        className={`w-full h-full ${entry.logoFit === "contain" ? "object-contain" : "object-cover"} ${entry.logoPadding ?? ""}`}
                      />
                    ) : (
                      <span className="text-xs text-white/40 font-bold">{entry.institutionName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 rounded-2xl p-4 border border-white/10 backdrop-blur-sm" style={{ backgroundColor: `${entry.accentColor}12` }}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                      <div>
                        <p className="text-white font-bold">{entry.title}</p>
                        <p className="text-white/60 text-sm">{entry.institutionName}</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap self-start" style={{ borderColor: `${entry.accentColor}60`, color: entry.accentColor, backgroundColor: `${entry.accentColor}15` }}>
                        {entry.dateRange}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed mb-1">{entry.description1}</p>
                    {entry.description2 && <p className="text-white/50 text-sm leading-relaxed">{entry.description2}</p>}
                    {entry.link && (
                      <a
                        href={entry.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs font-medium underline underline-offset-2 transition-colors"
                        style={{ color: entry.accentColor }}
                      >
                        {entry.link.label} ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DepthSection>

        {/* ── PROJECTS ─────────────────────────────────── */}
        <DepthSection id="projects">
          <DepthLabel depth="~500m" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Projects</h2>
          <p className="text-blue-300 text-lg mb-10">Things I&apos;ve built</p>
          <ProjectsGallery />
        </DepthSection>

        {/* ── SKILLS ───────────────────────────────────── */}
        <DepthSection id="skills">
          <DepthLabel depth="~1000m" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Skills & Tools</h2>
          <p className="text-blue-300 text-lg mb-10">What I bring to the table</p>

          {/* Skill categories */}
          <div className="flex flex-col gap-6 mb-12">
            {skillsData.map((category) => (
              <div key={category.heading} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">{category.heading}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-full text-sm font-medium text-white/85 bg-white/8 border border-white/10 hover:border-blue-400/40 hover:text-white transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {toolsData.map((tool) => (
              <div key={tool.title} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 backdrop-blur-sm">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{tool.title}</p>
                <div className="flex flex-col gap-1.5">
                  {tool.items.map((item) => (
                    <span key={item} className="text-white text-sm font-medium">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="text-center pt-16 pb-20 border-t border-white/10">
            <DepthLabel depth="~3800m" />
            <p className="text-white/40 text-sm tracking-widest uppercase mb-3">— Abyss reached —</p>
            <h3 className="text-3xl font-bold text-white mb-4">Let&apos;s work together</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">You&apos;ve made it to the bottom. If you&apos;re still here, we should probably talk.</p>
            <a href="mailto:billyhkaufman@gmail.com" className="btn-cta px-8 py-4 font-bold rounded-xl text-lg">
              Get in touch
            </a>
          </div>

          {/* Fish eat fish — desktop only */}
          <div className="hidden md:block border-t border-white/10 pt-8 pb-2">
            <p className="text-white/30 text-xs text-center tracking-widest uppercase mb-6">Eat or be eaten</p>
            <FishEat />
          </div>

          {/* Sea floor hop — mobile only */}
          <div className="block md:hidden border-t border-white/10 pt-8 pb-2">
            <p className="text-white/30 text-xs text-center tracking-widest uppercase mb-6">Hop or be squished</p>
            <SeaFloorHop />
          </div>
        </DepthSection>

      </main>

      {/* <footer className="relative z-10">
        <CoralSlalom />
      </footer> */}
    </>
  );
}
