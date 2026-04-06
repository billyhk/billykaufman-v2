"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { clientsData } from "@/data/clients";
import {
  BloombergLogo,
  CrsLogo,
  PharmacareLogo,
  SebpoLogo,
  VerifyLogo,
  WestrockLogo,
} from "./ClientLogos";

type LogoKey = "bloomberg" | "westrock" | "sebpo" | "pharmacare" | "crs" | "verify";

const LOGO_MAP: Record<LogoKey, React.ReactNode> = {
  bloomberg: <BloombergLogo className="w-full max-h-8 object-contain" />,
  westrock: <WestrockLogo className="max-h-20 w-full" />,
  sebpo: <SebpoLogo className="w-16 h-16" />,
  pharmacare: <PharmacareLogo className="w-full max-h-10 object-contain" />,
  crs: <CrsLogo className="w-full max-h-8 object-contain" />,
  verify: <VerifyLogo className="w-12 h-12" />,
};

function ClientCard({
  title,
  description,
  logoKey,
  accentColor,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  logoKey: LogoKey;
  accentColor: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className="relative w-full cursor-pointer rounded-2xl border text-left focus:outline-none"
      style={{
        borderColor: isOpen ? `${accentColor}60` : "rgba(255,255,255,0.1)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: isOpen ? `0 0 20px 2px ${accentColor}25` : "none",
      }}
      aria-expanded={isOpen}
    >
      {/* Front — logo */}
      <div
        className="flex flex-col items-center justify-center gap-4 p-6 h-36 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isOpen ? 0 : 1,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-center w-full px-4">
          {LOGO_MAP[logoKey]}
        </div>
        <p className="text-white/50 text-xs font-medium text-center">{title}</p>
      </div>

      {/* Back — description (solid, readable) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          backgroundColor: "rgba(10, 18, 35, 0.97)",
          border: `1px solid ${accentColor}40`,
        }}
      >
        <p className="text-white font-semibold text-sm text-center">{title}</p>
        <p className="text-white/70 text-xs leading-relaxed text-center">{description}</p>
        <p className="text-white/30 text-xs mt-1">Tap to close</p>
      </div>
    </motion.button>
  );
}

const LOGO_KEYS: LogoKey[] = ["bloomberg", "westrock", "sebpo", "pharmacare", "crs", "verify"];

export default function ClientsGrid() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <div className="mt-16">
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        Clients I&apos;ve Shipped For
      </h3>
      <p className="text-white/40 text-sm text-center mb-8">Tap a card to learn more</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {clientsData.map((c, i) => (
          <ClientCard
            key={c.title}
            title={c.title}
            description={c.description}
            logoKey={LOGO_KEYS[i]}
            accentColor={c.accentColor}
            isOpen={openIdx === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </div>
  );
}
