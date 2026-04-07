import HeroContent from "@/components/HeroContent";
import DepthSection from "@/components/ocean/DepthSection";
import DepthLabel from "@/components/ocean/DepthLabel";
import { OceanCanvas, ProjectsGallery } from "@/components/ClientOnly";
import ClientsGrid from "@/components/ClientsGrid";
import { bioData, RESUME_URL, IS_OPEN_TO_WORK } from "@/data/bio";
import { socialLinks } from "@/data/social";
import SkillsSection from "@/components/SkillsSection";
import { experienceData } from "@/data/experience";
import Image from "next/image";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import FishEat from "@/components/FishEat";
import SeaFloorHop from "@/components/SeaFloorHop";

function EmploymentStatus() {
  if (IS_OPEN_TO_WORK) {
    return (
      <span className="flex items-center gap-2 text-sm text-white/60">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        Open to new opportunities
      </span>
    );
  }
  return (
    <span className="text-sm text-white/60">
      {experienceData[0].title} at {experienceData[0].institutionName}
    </span>
  );
}

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

              {/* Stat chips */}
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

            {/* Headshot with glow ring */}
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

        {/* ── EXPERIENCE ───────────────────────────────── */}
        <DepthSection id="experience">
          <DepthLabel depth="~200m" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Experience</h2>
          <p className="text-blue-300 text-lg mb-10">My journey so far</p>

          <ExperienceTimeline />
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

          <SkillsSection />

          {/* Contact */}
          <div className="pt-16 pb-20 border-t border-white/10">
            <DepthLabel depth="~3800m" />
            <div className="flex flex-col md:flex-row gap-12 items-start justify-between">
              {/* Left: CTA */}
              <div className="flex-1">
                <p className="text-white/40 text-sm tracking-widest uppercase mb-3">— Abyss reached —</p>
                <h3 className="text-3xl font-bold text-white mb-4">Let&apos;s work together</h3>
                <p className="text-white/60 mb-8 max-w-sm">You&apos;ve made it to the bottom. If you&apos;re still here, we should probably talk.</p>
                <a href="mailto:billyhkaufman@gmail.com" className="btn-cta px-8 py-4 font-bold rounded-xl text-lg">
                  Get in touch
                </a>
              </div>

              {/* Right: info + socials */}
              <div className="flex flex-col gap-5 md:items-end">
                {/* Status + location */}
                <div className="flex flex-col gap-2 md:items-end">
                  <EmploymentStatus />
                  <span className="text-sm text-white/40">New York City</span>
                </div>

                {/* Social links */}
                <div className="flex flex-col gap-2 md:items-end">
                  {socialLinks.map(({ Icon, href, displayName, label }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-white/40 hover:text-white transition-colors group"
                    >
                      <span className="text-xs group-hover:text-blue-300 transition-colors">{displayName}</span>
                      <Icon size={15} className="group-hover:text-blue-300 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
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

    </>
  );
}
