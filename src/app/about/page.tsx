import Image from "next/image";
import { bioData, RESUME_URL } from "@/data/bio";
import { skillsData } from "@/data/skills";
import { toolsData } from "@/data/tools";
import { clientsData } from "@/data/clients";
import FadeInSection from "@/components/FadeInSection";

export const metadata = {
  title: "About — Billy Kaufman",
};

function SectionHeader({
  heading,
  subheading,
}: {
  heading: string;
  subheading?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl md:text-4xl font-bold text-white">{heading}</h2>
      {subheading && (
        <p className="text-blue-300 mt-1 text-lg">{subheading}</p>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto space-y-24">
      {/* Bio */}
      <section>
        <SectionHeader
          heading="About Me"
          subheading="Allow me to introduce myself..."
        />
        <FadeInSection>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 space-y-4 text-white/80 text-base leading-relaxed">
              <p className="text-xl font-semibold text-white">{bioData.name}</p>
              <p className="text-blue-300">{bioData.title}</p>
              <p>{bioData.paragraphs[0]}</p>
              <p>
                Strong engineering professional with a full-stack engineering
                certificate from{" "}
                <a
                  href={bioData.generalAssemblyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  General Assembly
                </a>
                .
              </p>
              <p>{bioData.paragraphs[2]}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Download Resume
                </a>
                <a
                  href="mailto:billyhkaufman@gmail.com"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors text-sm"
                >
                  Hire Me
                </a>
              </div>
            </div>
            <Image
              src={bioData.headshotSrc}
              alt="Headshot of Billy Kaufman"
              width={260}
              height={260}
              className="rounded-2xl object-cover shadow-xl ring-2 ring-white/10 self-start"
            />
          </div>
        </FadeInSection>
      </section>

      {/* Skills */}
      <section>
        <SectionHeader heading="Skills" subheading="What I bring to the table" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skillsData.map((skill, i) => (
            <FadeInSection key={skill.heading} delay={i * 0.08}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <h3 className="text-lg font-bold text-white mb-3">
                  {skill.heading}
                </h3>
                <ul className="space-y-1.5">
                  {skill.bodyList.map((item) => (
                    <li
                      key={item}
                      className="text-white/70 text-sm flex items-start gap-2"
                    >
                      <span className="text-blue-400 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section>
        <SectionHeader heading="Tools" subheading="My everyday toolkit" />
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {toolsData.map((tool) => (
              <div
                key={tool.title}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <span className="text-white/50 text-sm font-medium">
                  {tool.title}
                </span>
                <span className="text-white text-sm font-semibold">
                  {tool.copy}
                </span>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Clients */}
      <section>
        <SectionHeader
          heading="Clients"
          subheading="Companies I've built products for"
        />
        <FadeInSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {clientsData.map((client) => (
              <div
                key={client.title}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <p className="text-white font-semibold text-sm mb-1">
                  {client.title}
                </p>
                <p className="text-white/50 text-xs leading-relaxed">
                  {client.description}
                </p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>
    </main>
  );
}
