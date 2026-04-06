"use client";

import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { socialLinks } from "@/data/social";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
];

function scrollTo(id: string) {
  document.getElementById(id.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => scrollTo("#home")}
            className="text-white font-bold text-lg tracking-wide hover:text-blue-300 transition-colors z-50"
          >
            BK
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => {
              const id = href.replace("#", "");
              return (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  className={`text-sm font-medium transition-colors ${
                    active === id
                      ? "text-blue-300 border-b border-blue-300 pb-0.5"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1 z-50 relative"
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

      {/* Full-screen mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col md:hidden">
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <span className="text-white font-bold text-lg tracking-wide">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white transition-colors"><HiX size={22} /></button>
              </div>
              <div className="flex flex-col px-6 pt-6 gap-1 flex-1">
                {navLinks.map(({ href, label }, i) => (
                  <motion.div key={href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.06, duration: 0.25 }}>
                    <button
                      onClick={() => { scrollTo(href); setMobileOpen(false); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        active === href.replace("#", "")
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {label}
                    </button>
                  </motion.div>
                ))}
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
