"use client";

import { useState, useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useHudVisible } from "@/hooks/useHudVisible";
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

// ─── Nav link — vertical slide on hover ──────────────────────────────────────
const SLIDE_EASE = [0.4, 0, 0.2, 1] as const;
const SLIDE_DUR  = 0.18;

function NavLinkItem({ href, label, index, isActive, onClick }: {
  href: string; label: string; index: number; isActive: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="relative flex items-center gap-1.5 cursor-pointer"
    >
      {/* Index */}
      <span
        className="text-[9px] font-mono leading-none transition-opacity duration-150"
        style={{ color: "var(--zone-accent)", opacity: hovered ? 0.85 : 0.4 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Text slide container */}
      <span className="relative overflow-hidden block" style={{ height: "1.25rem" }}>
        {/* Resting — slides out upward */}
        <motion.span
          className="block text-sm font-medium whitespace-nowrap"
          animate={{ y: hovered ? "-100%" : "0%" }}
          transition={{ duration: SLIDE_DUR, ease: SLIDE_EASE }}
          style={{ color: isActive ? "var(--zone-accent)" : "rgba(255,255,255,0.65)", lineHeight: "1.25rem" }}
        >
          {label}
        </motion.span>
        {/* Hover — slides in from below, accent color */}
        <motion.span
          className="block text-sm font-medium whitespace-nowrap absolute top-0 left-0"
          animate={{ y: hovered ? "0%" : "100%" }}
          transition={{ duration: SLIDE_DUR, ease: SLIDE_EASE }}
          style={{ color: "var(--zone-accent)", lineHeight: "1.25rem" }}
        >
          {label}
        </motion.span>
      </span>

      {/* Active underline — shared layoutId makes it travel between items */}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-px left-0 right-0 h-px"
          style={{ backgroundColor: "var(--zone-accent)" }}
          transition={{ type: "tween", duration: 0.2, ease: [0.4, 0, 0.6, 1] }}
        />
      )}
    </button>
  );
}

// Shared corner bracket lines used by both badge variants
const BADGE_SPRING = { type: "spring", stiffness: 380, damping: 22 } as const;
function CornerBrackets({ b, scale }: {
  b: React.SVGProps<SVGLineElement>;
  scale: number | boolean;
}) {
  return (
    <motion.g
      style={{ transformOrigin: "27px 15px" }}
      animate={{ scale: scale ? 1 : 0 }}
      transition={BADGE_SPRING}
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
  );
}

// Mobile BK badge — corners spring in on tap, spring out after a beat
function StaticBkBadge({ active }: { active: boolean }) {
  const accent = "var(--zone-accent)";
  const b = { stroke: accent, strokeWidth: 1.5, strokeOpacity: 0.72, strokeLinecap: "square" as const };
  return (
    <svg width="54" height="30" viewBox="0 0 54 30" fill="none" aria-hidden="true" style={{ opacity: 0.75 }}>
      <text x="27" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="800"
        fontFamily="ui-monospace, monospace" letterSpacing="0.12em" fillOpacity="0.88">BK</text>
      <CornerBrackets b={b} scale={active} />
    </svg>
  );
}

// Desktop BK badge — scan lines diverge from center revealing text; corners spring in/out on hover
function BkBadge({ hovered }: { hovered: boolean }) {
  const accent = "var(--zone-accent)";
  const D = 1.2;
  const scanDur = 0.4;
  const afterScan = D + scanDur + 0.05;
  const b = { stroke: accent, strokeWidth: 1.5, strokeOpacity: 0.72, strokeLinecap: "square" as const };

  return (
    <svg
      width="54" height="30" viewBox="0 0 54 30" fill="none"
      className="opacity-75 group-hover:opacity-100 transition-opacity duration-300 group-hover:drop-shadow-[0_0_8px_var(--zone-accent)]"
      aria-hidden="true"
    >
      {/* BK text — fades in as scanner travels */}
      <motion.text
        x="27" y="20" textAnchor="middle" fill="white"
        fontSize="14" fontWeight="800" fontFamily="ui-monospace, monospace" letterSpacing="0.12em"
        initial={{ opacity: 0 }} animate={{ opacity: 0.88 }}
        transition={{ delay: D + 0.08, duration: scanDur }}
      >BK</motion.text>

      {/* Top scan line */}
      <motion.line x1="2" y1="2" x2="52" y2="2"
        stroke={accent} strokeWidth="1" strokeOpacity="0.45"
        initial={{ translateY: 13, opacity: 1 }}
        animate={{ translateY: 0, opacity: 0 }}
        transition={{
          translateY: { delay: D, duration: scanDur, ease: SLIDE_EASE },
          opacity: { delay: afterScan, duration: 0.2 },
        }}
      />

      {/* Bottom scan line */}
      <motion.line x1="2" y1="28" x2="52" y2="28"
        stroke={accent} strokeWidth="1" strokeOpacity="0.45"
        initial={{ translateY: -13, opacity: 1 }}
        animate={{ translateY: 0, opacity: 0 }}
        transition={{
          translateY: { delay: D, duration: scanDur, ease: SLIDE_EASE },
          opacity: { delay: afterScan, duration: 0.2 },
        }}
      />

      {/* Corner brackets — spring in on hover, spring out on leave */}
      <CornerBrackets b={b} scale={hovered} />
    </svg>
  );
}

// ─── Animated 2-line hamburger / X ───────────────────────────────────────────
// ─── Animated 3-line hamburger → X ───────────────────────────────────────────
// Open:  lines converge to center (phase 1), middle fades, outer two rotate into X (phase 2)
// Close: X unrotates (phase 1), middle reappears, outer two spread back out (phase 2)
function MenuIcon({ isOpen }: { isOpen: boolean }) {
  const base: React.CSSProperties = {
    position: "absolute", left: 0, height: 1.5,
    backgroundColor: "white", borderRadius: 1, transformOrigin: "center",
  };
  // Container: 22×18px. Lines have staggered widths in hamburger state.
  // All equalize to full width as they converge, then rotate into X.
  return (
    <div style={{ position: "relative", width: 22, height: 18 }}>
      {/* Top line — grows then converges + rotates CW */}
      <motion.span
        style={{ ...base, top: 0 }}
        animate={isOpen ? { width: [22, 28, 22], y: 8.25, rotate: 45 } : { width: 22, y: 0, rotate: 0 }}
        transition={isOpen
          ? { width: { duration: 0.48, times: [0, 0.35, 1], ease: "easeIn" }, y: { delay: 0.08, duration: 0.18, ease: "easeIn" }, rotate: { delay: 0.24, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] } }
          : { rotate: { duration: 0.14, ease: "easeIn" }, y: { delay: 0.12, duration: 0.22, ease: "easeOut" }, width: { delay: 0.28, duration: 0.18 } }
        }
      />
      {/* Middle line — grows then fades as lines converge */}
      <motion.span
        style={{ ...base, top: 8.25 }}
        animate={isOpen ? { width: [15, 28, 22], opacity: 0, scaleX: 0.2 } : { width: 15, opacity: 1, scaleX: 1 }}
        transition={isOpen
          ? { width: { duration: 0.48, times: [0, 0.35, 1], ease: "easeIn" }, opacity: { delay: 0.1, duration: 0.14, ease: "easeIn" }, scaleX: { delay: 0.1, duration: 0.14 } }
          : { delay: 0.3, duration: 0.18, ease: "easeOut" }
        }
      />
      {/* Bottom line — grows then converges + rotates CCW */}
      <motion.span
        style={{ ...base, bottom: 0 }}
        animate={isOpen ? { width: [11, 28, 22], y: -8.25, rotate: -45 } : { width: 11, y: 0, rotate: 0 }}
        transition={isOpen
          ? { width: { duration: 0.48, times: [0, 0.35, 1], ease: "easeIn" }, y: { delay: 0.08, duration: 0.18, ease: "easeIn" }, rotate: { delay: 0.24, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] } }
          : { rotate: { duration: 0.14, ease: "easeIn" }, y: { delay: 0.12, duration: 0.22, ease: "easeOut" }, width: { delay: 0.28, duration: 0.18 } }
        }
      />
    </div>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive]         = useState("home");
  const [depth, setDepth]           = useState(0);
  const ready                        = useHudVisible();
  const [bkHovered, setBkHovered]       = useState(false);
  const [mobileBkActive, setMobileBkActive] = useState(false);
  const [selectedHref, setSelectedHref] = useState<string | null>(null);

  const handleMobileNavClick = (href: string) => {
    setSelectedHref(href);
    // Let scan line + highlight play, then start closing (icon reverts simultaneously)
    setTimeout(() => setMobileOpen(false), 320);
    // Scroll after the curtain has mostly closed
    setTimeout(() => {
      scrollTo(href);
      setSelectedHref(null);
    }, 700);
  };

  // Live depth — same transform as DepthGauge
  const { scrollYProgress } = useScroll();
  const depthMV = useTransform(scrollYProgress, [...DEPTH_STOPS], [...DEPTH_VALS]);
  useMotionValueEvent(depthMV, "change", (v) => setDepth(Math.round(v)));

  useScrollLock(mobileOpen);

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
        className="fixed top-0 z-50 cursor-auto"
        style={{ left: "18px", right: "18px", background: "linear-gradient(to bottom, rgba(2,8,23,0.82) 0%, rgba(2,8,23,0.55) 70%, transparent 100%)" }}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Zone-accent bottom rule — ties nav into the HUD color system */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-25" style={{ backgroundColor: "var(--zone-accent)" }} />

        <div className="px-5 h-16 flex items-center justify-between gap-8">

          {/* BK — polygon HUD badge */}
          <button
            onClick={() => {
              scrollTo("#home");
              setMobileBkActive(true);
              setTimeout(() => setMobileBkActive(false), 450);
            }}
            onMouseEnter={() => setBkHovered(true)}
            onMouseLeave={() => setBkHovered(false)}
            className="group cursor-pointer shrink-0"
          >
            {/* Tap-animated logo on mobile */}
            <span className="block md:hidden"><StaticBkBadge active={mobileBkActive} /></span>
            {/* Hover-animated logo on desktop */}
            <span className="hidden md:block"><BkBadge hovered={bkHovered} /></span>
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

            {navLinks.map(({ href, label }, i) => (
              <NavLinkItem
                key={href}
                href={href}
                label={label}
                index={i}
                isActive={active === href.replace("#", "")}
                onClick={() => scrollTo(href)}
              />
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1 z-50 relative cursor-pointer"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <MenuIcon isOpen={mobileOpen} />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile fullscreen menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col md:hidden"
            style={{ background: "linear-gradient(160deg, #020817 0%, #010c1a 100%)", cursor: "default" }}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Align with navbar */}
            <div className="h-16 shrink-0" />
            <div className="h-px shrink-0 opacity-20" style={{ backgroundColor: "var(--zone-accent)" }} />

            {/* Nav links — large typographic list */}
            <div className="flex-1 flex flex-col justify-center px-8 gap-1">
              {navLinks.map(({ href, label }, i) => {
                const isActive   = active === href.replace("#", "");
                const isSelected = selectedHref === href;
                const isDimmed   = selectedHref !== null && !isSelected;
                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div animate={{ opacity: isDimmed ? 0.1 : 1 }} transition={{ duration: 0.18 }}>
                      <button
                        onClick={() => handleMobileNavClick(href)}
                        className="w-full text-left flex items-center gap-5 py-3 relative overflow-hidden cursor-pointer"
                      >
                        {/* Scan line sweep on select */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              key="scan"
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--zone-accent) 22%, transparent) 50%, transparent 100%)" }}
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{ duration: 0.38, ease: "easeOut" }}
                            />
                          )}
                        </AnimatePresence>

                        <span
                          className="font-mono text-[11px] tabular-nums shrink-0 w-5"
                          style={{ color: "var(--zone-accent)", opacity: isSelected || isActive ? 0.9 : 0.3 }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <span
                          className="text-5xl font-bold tracking-tight leading-none transition-colors duration-150"
                          style={{ color: isSelected || isActive ? "var(--zone-accent)" : "rgba(255,255,255,0.88)" }}
                        >
                          {label}
                        </span>

                        {isActive && (
                          <motion.span
                            layoutId="mobile-active-pip"
                            className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: "var(--zone-accent)" }}
                          />
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer — zone name + social */}
            <motion.div
              className="px-8 pb-10 flex items-center justify-between shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.3 }}
            >
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase opacity-35" style={{ color: "var(--zone-accent)" }}>
                {zoneName(depth)}
              </span>
              <div className="flex gap-5">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="text-white/25 hover:text-white transition-colors" aria-label={label}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
