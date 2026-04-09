import DepthLabel from "@/components/ocean/DepthLabel";
import EmploymentStatus from "@/components/EmploymentStatus";
import { socialLinks } from "@/data/social";

export default function ContactFooter() {
  return (
    <div className="pt-16 pb-20 border-t border-white/10">
      <DepthLabel depth="~3800m" />
      <div className="flex flex-col md:flex-row gap-12 items-start justify-between">
        <div className="flex-1">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-3">— Abyss reached —</p>
          <h3 className="text-3xl font-bold text-white mb-4">Let&apos;s work together</h3>
          <p className="text-white/60 mb-8 max-w-sm">You&apos;ve made it to the bottom. If you&apos;re still here, we should probably talk.</p>
          <a href="mailto:billyhkaufman@gmail.com" className="btn-cta clip-tr-lg px-8 py-4 font-bold text-lg">
            Get in touch
          </a>
        </div>

        <div className="flex flex-col gap-5 md:items-end">
          <div className="flex flex-col gap-2 md:items-end">
            <EmploymentStatus />
            <span className="text-sm text-white/40">New York City</span>
          </div>
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
  );
}
