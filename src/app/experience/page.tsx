import Image from "next/image";
import { experienceData } from "@/data/experience";
import FadeInSection from "@/components/FadeInSection";

export const metadata = {
  title: "Experience — Billy Kaufman",
};

export default function ExperiencePage() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-3xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Experience
        </h1>
        <p className="text-blue-300 mt-1 text-lg">My journey so far</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-10">
          {experienceData.map((entry, i) => (
            <FadeInSection key={entry.institutionName} delay={i * 0.06}>
              <div className="flex gap-6 relative">
                {/* Dot / Logo */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-white/20 overflow-hidden flex items-center justify-center z-10">
                  {entry.logoSrc ? (
                    <Image
                      src={entry.logoSrc}
                      alt={entry.institutionName}
                      width={40}
                      height={40}
                      className={`w-full h-full ${entry.logoFit === "contain" ? "object-contain" : "object-cover"} ${entry.logoPadding ?? ""}`}
                    />
                  ) : (
                    <span className="text-xs text-white/40 font-bold">
                      {entry.institutionName.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-2xl p-5 border border-white/10"
                  style={{ backgroundColor: `${entry.accentColor}18` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                    <div>
                      <p className="text-white font-bold text-base">
                        {entry.title}
                      </p>
                      <p className="text-white/60 text-sm">
                        {entry.institutionName}
                      </p>
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap self-start"
                      style={{
                        borderColor: `${entry.accentColor}60`,
                        color: entry.accentColor,
                        backgroundColor: `${entry.accentColor}15`,
                      }}
                    >
                      {entry.dateRange}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-2">
                    {entry.description1}
                  </p>
                  {entry.description2 && (
                    <p className="text-white/55 text-sm leading-relaxed">
                      {entry.description2}
                    </p>
                  )}
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </main>
  );
}
