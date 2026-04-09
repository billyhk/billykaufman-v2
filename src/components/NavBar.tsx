"use client";

import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { socialLinks } from "@/data/social";

const navLinks = [
  { href: "#home",       label: "Home"       },
  { href: "#about",      label: "About"      },
  { href: "#experience", label: "Experience" },
  { href: "#projects",   label: "Projects"   },
  { href: "#skills",     label: "Skills"     },
];

// Mirrors ZoneColorSync / DepthGauge stops
const DEPTH_STOPS = [0, 0.18, 0.38, 0.57, 0.74, 1] as const;
const DEPTH_VALS  = [0,   50,  200,  500, 1000, 3800] as const;

function zoneName(depth: number) {
  if (depth <   50) return "SUNLIGHT ZONE";
  if (depth <  200) return "TWILIGHT ZONE";
  if (depth <  500) return "MIDNIGHT ZONE";
  if (depth < 1000) return "ABYSSAL ZONE";
  return "HADAL ZONE";
}

function scrollTo(id: string) {
  document.getElementById(id.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
}

// Four corner ticks — same visual language as HudBrackets
function BracketBadge({ children }: { children: React.ReactNode }) {
  const corners = [
    "top-0 left-0 border-t border-l",
    "top-0 right-0 border-t border-r",
    "bottom-0 left-0 border-b border-l",
    "bottom-0 right-0 border-b border-r",
  ];
  return (
    <span className="relative inline-flex items-center justify-center px-2 py-1 group-hover:opacity-100 transition-opacity">
      {corners.map((cls, i) => (
        <span
          key={i}
          className={`absolute w-2 h-2 ${cls} opacity-50 group-hover:opacity-90 transition-opacity`}
          style={{ borderColor: "var(--zone-accent)" }}
        />
      ))}
      {children}
    </span>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive]         = useState("home");
  const [depth, setDepth]           = useState(0);

  // Live depth — same transform as DepthGauge
  const { scrollYProgress } = useScroll();
  const depthMV = useTransform(scrollYProgress, [...DEPTH_STOPS], [...DEPTH_VALS]);
  useMotionValueEvent(depthMV, "change", (v) => setDepth(Math.round(v)));

  // Section spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navLinks.forEach(({ href }) => {
      const el = document.getElementById(href.replace("#", ""));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="fixed top-0 z-50" style={{ left: "18px", right: "18px", background: "linear-gradient(to bottom, rgba(2,8,23,0.82) 0%, rgba(2,8,23,0.55) 70%, transparent 100%)" }}>
        {/* Zone-accent bottom rule — ties nav into the HUD color system */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-25" style={{ backgroundColor: "var(--zone-accent)" }} />

        <div className="px-5 h-16 flex items-center justify-between gap-8">

          {/* BK — HUD badge with corner brackets */}
          <button onClick={() => scrollTo("#home")} className="group cursor-pointer shrink-0">
            <BracketBadge>
              <span className="text-white font-bold text-base tracking-widest font-mono">BK</span>
            </BracketBadge>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">

            {/* Zone name — live, far left of link group */}
            <span
              className="text-[9px] font-mono tracking-[0.22em] uppercase opacity-45 mr-2 hidden lg:block"
              style={{ color: "var(--zone-accent)" }}
            >
              {zoneName(depth)}
            </span>

            {navLinks.map(({ href, label }, i) => {
              const id = href.replace("#", "");
              const isActive = active === id;
              return (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  className="relative flex items-baseline gap-1.5 cursor-pointer group"
                >
                  {/* Section index */}
                  <span
                    className="text-[9px] font-mono leading-none opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ color: "var(--zone-accent)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Label */}
                  <span
                    className={`text-sm font-medium transition-colors pb-px ${
                      isActive ? "" : "text-white/65 group-hover:text-white"
                    }`}
                    style={isActive ? { color: "var(--zone-accent)" } : undefined}
                  >
                    {label}
                  </span>

                  {/* Active underline — zone accent */}
                  {isActive && (
                    <span
                      className="absolute -bottom-px left-0 right-0 h-px"
                      style={{ backgroundColor: "var(--zone-accent)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1 z-50 relative cursor-pointer"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="block">
                  <HiX size={24} />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} className="block">
                  <HiMenu size={24} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile drawer — unchanged functionality, updated accent colors */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col md:hidden">
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <span className="text-white font-bold text-lg tracking-wide">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer"><HiX size={22} /></button>
              </div>
              <div className="flex flex-col px-6 pt-6 gap-1 flex-1">
                {navLinks.map(({ href, label }, i) => {
                  const isActive = active === href.replace("#", "");
                  return (
                    <motion.div key={href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.06, duration: 0.25 }}>
                      <button
                        onClick={() => { scrollTo(href); setMobileOpen(false); }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors cursor-pointer"
                        style={isActive ? { color: "var(--zone-accent)", backgroundColor: "color-mix(in srgb, var(--zone-accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--zone-accent) 20%, transparent)" } : { color: "rgba(255,255,255,0.7)" }}
                      >
                        <span className="text-[10px] font-mono opacity-50" style={{ color: "var(--zone-accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                        {label}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="px-6 py-6 border-t border-white/10 flex gap-5">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label={label}>
                    <Icon size={20} />
                  </a>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
