"use client";

import { useState, useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { socialLinks } from "@/data/social";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";

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

// BK badge — scan lines diverge from center revealing text, then corner brackets snap in
function BkBadge() {
  const accent = "var(--zone-accent)";
  const D = 1.2;                        // delay: nav has delay:0.6 + duration:0.55 → fully in at ~1.15s
  const scanDur = 0.4;
  const afterScan = D + scanDur + 0.05;
  const b = { stroke: accent, strokeWidth: 1.5, strokeOpacity: 0.72, strokeLinecap: "square" as const };

  return (
    <svg
      width="54" height="30" viewBox="0 0 54 30" fill="none"
      className="opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--zone-accent)]"
      aria-hidden="true"
    >
      {/* BK text — fades in as scanner travels */}
      <motion.text
        x="27" y="20" textAnchor="middle" fill="white"
        fontSize="14" fontWeight="800" fontFamily="ui-monospace, monospace" letterSpacing="0.12em"
        initial={{ opacity: 0 }} animate={{ opacity: 0.88 }}
        transition={{ delay: D + 0.08, duration: scanDur }}
      >BK</motion.text>

      {/* Top scan line — starts at center (translateY:13 offsets it from y=2 to y=15), scans up, then fades */}
      <motion.line x1="2" y1="2" x2="52" y2="2"
        stroke={accent} strokeWidth="1" strokeOpacity="0.45"
        initial={{ translateY: 13, opacity: 1 }}
        animate={{ translateY: 0, opacity: 0 }}
        transition={{
          translateY: { delay: D, duration: scanDur, ease: [0.4, 0, 0.2, 1] },
          opacity: { delay: afterScan, duration: 0.2 },
        }}
      />

      {/* Bottom scan line — starts at center (translateY:-13), scans down, then fades */}
      <motion.line x1="2" y1="28" x2="52" y2="28"
        stroke={accent} strokeWidth="1" strokeOpacity="0.45"
        initial={{ translateY: -13, opacity: 1 }}
        animate={{ translateY: 0, opacity: 0 }}
        transition={{
          translateY: { delay: D, duration: scanDur, ease: [0.4, 0, 0.2, 1] },
          opacity: { delay: afterScan, duration: 0.2 },
        }}
      />

      {/* Corner brackets — scale in from center once scan completes */}
      <motion.g
        style={{ transformOrigin: "27px 15px" }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: afterScan, duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <line x1="2"  y1="2"  x2="10" y2="2"  {...b} />
        <line x1="2"  y1="2"  x2="2"  y2="10" {...b} />
        <line x1="44" y1="2"  x2="52" y2="2"  {...b} />
        <line x1="52" y1="2"  x2="52" y2="10" {...b} />
        <line x1="2"  y1="28" x2="10" y2="28" {...b} />
        <line x1="2"  y1="20" x2="2"  y2="28" {...b} />
        <line x1="44" y1="28" x2="52" y2="28" {...b} />
        <line x1="52" y1="20" x2="52" y2="28" {...b} />
      </motion.g>
    </svg>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive]         = useState("home");
  const [depth, setDepth]           = useState(0);
  const [ready, setReady]           = useState(false);

  // Live depth — same transform as DepthGauge
  const { scrollYProgress } = useScroll();
  const depthMV = useTransform(scrollYProgress, [...DEPTH_STOPS], [...DEPTH_VALS]);
  useMotionValueEvent(depthMV, "change", (v) => setDepth(Math.round(v)));

  useScrollLock(mobileOpen);

  // Hold navbar off-screen until intro completes (mirrors DepthGauge / HudSensorPanel)
  useEffect(() => {
    if (window.scrollY > window.innerHeight * 0.5) { setReady(true); return; }
    const t = setTimeout(() => setReady(true), INTRO_TOTAL * 1000);
    return () => clearTimeout(t);
  }, []);

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

  if (!ready) return null;

  return (
    <>
      <motion.nav
        className="fixed top-0 z-50"
        style={{ left: "18px", right: "18px", background: "linear-gradient(to bottom, rgba(2,8,23,0.82) 0%, rgba(2,8,23,0.55) 70%, transparent 100%)" }}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Zone-accent bottom rule — ties nav into the HUD color system */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-25" style={{ backgroundColor: "var(--zone-accent)" }} />

        <div className="px-5 h-16 flex items-center justify-between gap-8">

          {/* BK — polygon HUD badge */}
          <button onClick={() => scrollTo("#home")} className="group cursor-pointer shrink-0">
            <BkBadge />
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
      </motion.nav>

      {/* Mobile drawer — unchanged functionality, updated accent colors */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[rgba(2,8,23,0.97)] backdrop-blur-xl border-l flex flex-col md:hidden" style={{ borderColor: "color-mix(in srgb, var(--zone-accent) 25%, transparent)" }}>

              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b" style={{ borderColor: "color-mix(in srgb, var(--zone-accent) 15%, transparent)" }}>
                <span className="text-[9px] font-mono tracking-[0.25em] uppercase opacity-50" style={{ color: "var(--zone-accent)" }}>
                  {zoneName(depth)}
                </span>
                <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer" aria-label="Close menu">
                  <HiX size={20} />
                </button>
              </div>

              {/* Links — scrollable so nothing clips on short screens */}
              <div className="flex flex-col px-4 pt-5 gap-0.5 overflow-y-auto flex-1">
                {navLinks.map(({ href, label }, i) => {
                  const isActive = active === href.replace("#", "");
                  return (
                    <motion.div key={href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + i * 0.05, duration: 0.22 }}>
                      <button
                        onClick={() => { scrollTo(href); setMobileOpen(false); }}
                        className="w-full text-left flex items-center gap-3 px-3 py-3.5 text-base font-medium transition-colors cursor-pointer border-b"
                        style={{
                          borderColor: "rgba(255,255,255,0.06)",
                          color: isActive ? "var(--zone-accent)" : "rgba(255,255,255,0.55)",
                        }}
                      >
                        <span className="text-[10px] font-mono w-5 shrink-0 opacity-40" style={{ color: "var(--zone-accent)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {label}
                        {isActive && (
                          <span className="ml-auto w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: "var(--zone-accent)" }} />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social links */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="px-5 py-5 border-t flex gap-5 shrink-0" style={{ borderColor: "color-mix(in srgb, var(--zone-accent) 15%, transparent)" }}>
                {socialLinks.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label={label}>
                    <Icon size={18} />
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
