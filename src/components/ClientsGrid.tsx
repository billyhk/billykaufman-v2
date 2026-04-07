"use client";

import { useRef, useState } from "react";
import { DARK_MODAL_BG } from "@/constants/colors";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
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

type LogoKey = "bloomberg" | "westrock" | "sebpo" | "pharmacare" | "crs" | "verify" | "jnj" | "dominos";

const LOGO_MAP: Record<LogoKey, React.ReactNode> = {
  bloomberg: <BloombergLogo className="w-full max-h-8 object-contain" />,
  westrock: <WestrockLogo className="max-h-16 w-full" />,
  sebpo: <SebpoLogo className="w-14 h-14" />,
  pharmacare: <PharmacareLogo className="w-full max-h-10 object-contain" />,
  crs: <CrsLogo className="w-full max-h-8 object-contain" />,
  verify: <VerifyLogo className="w-12 h-12" />,
  jnj: <JnjLogo className="w-full max-h-10 object-contain" />,
  dominos: <DominosLogo className="w-14 h-14" />,
};

const LOGO_KEYS: LogoKey[] = ["bloomberg", "westrock", "sebpo", "pharmacare", "crs", "verify", "jnj", "dominos"];

const SPRING = { stiffness: 260, damping: 24 };
const TILT = 12; // max degrees

function TiltCard({
  logoKey,
  title,
  accentColor,
  onClick,
}: {
  logoKey: LogoKey;
  title: string;
  accentColor: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const rotateX = useSpring(rawX, SPRING);
  const rotateY = useSpring(rawY, SPRING);

  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, ${accentColor}28, transparent 65%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;  // 0–1
    const y = (e.clientY - rect.top)  / rect.height; // 0–1
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
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 700,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
      className="relative flex flex-col items-center justify-center gap-4 p-6 h-36 rounded-2xl border cursor-pointer focus:outline-none overflow-hidden"
    >
      {/* Mouse-tracked glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: glowBg }}
      />

      <div className="relative flex items-center justify-center w-full px-4">
        {LOGO_MAP[logoKey]}
      </div>
      <p className="relative text-white/50 text-xs font-medium text-center">{title}</p>
    </motion.button>
  );
}

function ClientModal({
  title,
  description,
  logoKey,
  accentColor,
  onClose,
}: {
  title: string;
  description: string;
  logoKey: LogoKey;
  accentColor: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-auto"
      onClick={onClose}
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
          border: `1px solid ${accentColor}50`,
          boxShadow: `0 0 40px 4px ${accentColor}20`,
        }}
      >
        <div className="flex items-center justify-center w-full px-4 py-2">
          {LOGO_MAP[logoKey]}
        </div>
        <h3 className="text-white font-bold text-lg text-center">{title}</h3>
        <p className="text-white/70 text-sm leading-relaxed text-center">{description}</p>
        <button
          onClick={onClose}
          className="mt-2 text-white/30 hover:text-white/60 text-xs transition-colors cursor-pointer"
        >
          Tap to close
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ClientsGrid() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const openClient = openIdx !== null ? clientsData[openIdx] : null;

  return (
    <div className="mt-16">
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        Clients I&apos;ve Shipped For
      </h3>
      <p className="text-white/40 text-sm text-center mb-8">Tap a card to learn more</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {clientsData.map((c, i) => (
          <TiltCard
            key={c.title}
            logoKey={LOGO_KEYS[i]}
            title={c.title}
            accentColor={c.accentColor}
            onClick={() => setOpenIdx(i)}
          />
        ))}
      </div>

      <AnimatePresence>
        {openClient && openIdx !== null && (
          <ClientModal
            title={openClient.title}
            description={openClient.description}
            logoKey={LOGO_KEYS[openIdx]}
            accentColor={openClient.accentColor}
            onClose={() => setOpenIdx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
