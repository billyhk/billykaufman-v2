"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { DARK_MODAL_BG } from "@/constants/colors";
import { clientsData } from "@/data/clients";
import {
  BloombergLogo,
  CrsLogo,
  DominosLogo,
  JnjLogo,
  PharmacareLogo,
  SebpoLogo,
  VerifyLogo,
  WestrockLogo,
} from "./ClientLogos";

type LogoKey =
  | "bloomberg"
  | "westrock"
  | "sebpo"
  | "pharmacare"
  | "crs"
  | "verify"
  | "jnj"
  | "dominos";

const LOGO_KEYS: LogoKey[] = [
  "bloomberg",
  "westrock",
  "sebpo",
  "pharmacare",
  "crs",
  "verify",
  "jnj",
  "dominos",
];

const LOGO_MAP: Record<LogoKey, React.ReactNode> = {
  bloomberg: <BloombergLogo className="h-7 w-auto max-w-full" />,
  westrock: <WestrockLogo className="max-h-20 w-full" />,
  sebpo: <SebpoLogo className="w-12 h-12" />,
  pharmacare: <PharmacareLogo className="w-full max-h-8 object-contain" />,
  crs: <CrsLogo className="w-full max-h-8 object-contain" />,
  verify: <VerifyLogo className="w-10 h-10" />,
  jnj: <JnjLogo className="w-14 h-14" />,
  dominos: <DominosLogo className="w-12 h-12" />,
};

const SPRING = { stiffness: 260, damping: 24 };
const TILT = 10;

function TiltCard({
  logoKey,
  accentColor,
  onClick,
}: {
  logoKey: LogoKey;
  accentColor: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const rotateX = useSpring(rawX, SPRING);
  const rotateY = useSpring(rawY, SPRING);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, ${accentColor}28, transparent 65%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rawY.set((x - 0.5) * TILT * 2);
    rawX.set((y - 0.5) * -TILT * 2);
    glowX.set(x * 100);
    glowY.set(y * 100);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 700,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="relative flex items-center justify-center w-40 h-28 mx-3 rounded-2xl border overflow-hidden shrink-0 cursor-pointer"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: glowBg }}
      />
      <div
        className="w-full px-5 py-3"
        style={{
          display: "grid",
          justifyItems: "center",
          alignItems: "center",
        }}
      >
        {LOGO_MAP[logoKey]}
      </div>
    </motion.div>
  );
}

const CARDS = LOGO_KEYS.map((key, i) => ({
  key,
  client: clientsData[i],
}));

export default function ClientsMarquee() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const openClient = openIdx !== null ? clientsData[openIdx] : null;
  const openLogoKey = openIdx !== null ? LOGO_KEYS[openIdx] : null;

  useEffect(() => setMounted(true), []);
  useScrollLock(openIdx !== null);

  return (
    <section className="py-16 border-y border-white/8 overflow-hidden">
      <p className="text-white/30 text-xs tracking-[0.25em] uppercase text-center mb-10">
        Clients I&apos;ve Shipped For
      </p>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="marquee-track flex items-center w-max">
          {[...CARDS, ...CARDS].map(({ key, client }, i) => (
            <TiltCard
              key={`${key}-${i}`}
              logoKey={key}
              accentColor={client.accentColor}
              onClick={() => setOpenIdx(i % CARDS.length)}
            />
          ))}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {openClient && openLogoKey && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
              style={{ cursor: "auto" }}
              onClick={() => setOpenIdx(null)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4"
                style={{
                  backgroundColor: DARK_MODAL_BG,
                  border: `1px solid ${openClient.accentColor}50`,
                  boxShadow: `0 0 40px 4px ${openClient.accentColor}20`,
                }}
              >
                <div className="flex items-center justify-center w-full px-4 py-2">
                  {LOGO_MAP[openLogoKey]}
                </div>
                <h3 className="text-white font-bold text-lg text-center">
                  {openClient.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed text-center">
                  {openClient.description}
                </p>
                {openClient.url && (
                  <a
                    href={openClient.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors"
                    style={{ color: openClient.accentColor }}
                  >
                    {new URL(openClient.url).hostname.replace(/^www\./, "")} ↗
                  </a>
                )}
                <button
                  onClick={() => setOpenIdx(null)}
                  className="mt-1 text-white/30 hover:text-white/60 text-xs transition-colors cursor-pointer"
                >
                  Tap to close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
