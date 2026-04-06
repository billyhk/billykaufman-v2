import HeroContent from "@/components/HeroContent";
import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { OceanCanvas, ProjectsGallery } from "@/components/ClientOnly";
import { bioData, RESUME_URL } from "@/data/bio";
import { skillsData } from "@/data/skills";
import { toolsData } from "@/data/tools";
import { clientsData } from "@/data/clients";
import { experienceData } from "@/data/experience";
import Image from "next/image";

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
                Strong engineering professional with a full-stack engineering certificate from{" "}
                <a href={bioData.generalAssemblyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline underline-offset-2">
                  General Assembly
                </a>.
              </p>
              <p className="text-white/75 leading-relaxed">{bioData.paragraphs[2]}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm">
                  Download Resume
                </a>
                <a href="mailto:billyhkaufman@gmail.com" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors text-sm">
                  Hire Me
                </a>
              </div>
            </div>
            <Image
              src={bioData.headshotSrc}
              alt="Headshot of Billy Kaufman"
              width={240}
              height={240}
              style={{ height: "auto" }}
              className="rounded-2xl object-cover shadow-xl ring-2 ring-white/10 self-start"
            />
          </div>

          {/* Clients */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Clients</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {clientsData.map((c) => (
                <div key={c.title} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-white font-semibold text-sm">{c.title}</p>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </DepthSection>

        {/* ── EXPERIENCE ───────────────────────────────── */}
        <DepthSection id="experience">
          <DepthLabel depth="~200m" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Experience</h2>
          <p className="text-blue-300 text-lg mb-10">My journey so far</p>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-8">
              {experienceData.map((entry) => (
                <div key={entry.institutionName} className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800/80 border-2 border-white/20 overflow-hidden flex items-center justify-center z-10 backdrop-blur-sm">
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
                  <div className="flex-1 rounded-2xl p-5 border border-white/10 backdrop-blur-sm" style={{ backgroundColor: `${entry.accentColor}12` }}>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {skillsData.map((skill) => (
              <div key={skill.heading} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-white font-bold text-lg mb-3">{skill.heading}</h3>
                <ul className="space-y-1.5">
                  {skill.bodyList.map((item) => (
                    <li key={item} className="text-white/65 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {toolsData.map((tool) => (
              <div key={tool.title} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between backdrop-blur-sm">
                <span className="text-white/50 text-sm">{tool.title}</span>
                <span className="text-white text-sm font-semibold">{tool.copy}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="text-center py-16 border-t border-white/10">
            <p className="text-white/40 text-sm tracking-widest uppercase mb-3">— Abyss reached —</p>
            <h3 className="text-3xl font-bold text-white mb-4">Let&apos;s work together</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">You&apos;ve made it to the bottom. If you&apos;re still here, we should probably talk.</p>
            <a href="mailto:billyhkaufman@gmail.com" className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors text-lg">
              Get in touch
            </a>
          </div>
        </DepthSection>

      </main>
    </>
  );
}
