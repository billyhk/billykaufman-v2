"use client";

import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "cta-lg";

const VARIANT_CLS: Record<Variant, string> = {
  primary:   "btn-cta clip-tr-bl px-5 py-2.5 font-semibold text-sm cursor-pointer",
  secondary: "clip-bl px-5 py-2.5 bg-white/8 hover:bg-white/15 text-white font-semibold border border-white/15 transition-colors text-sm",
  "cta-lg":  "btn-cta clip-tr-lg px-8 py-4 font-bold text-lg",
};

const VARIANT_TAP: Record<Variant, { scale: number }> = {
  primary:   { scale: 0.94 },
  secondary: { scale: 0.94 },
  "cta-lg":  { scale: 0.97 },
};

interface Props {
  variant?: Variant;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  target?: string;
  rel?: string;
  download?: string;
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = "secondary",
  href,
  onClick,
  target,
  rel,
  download,
  type = "button",
  children,
  className,
}: Props) {
  const cls = [VARIANT_CLS[variant], className].filter(Boolean).join(" ");
  const tap = VARIANT_TAP[variant];

  if (href) {
    return (
      <motion.a href={href} target={target} rel={rel} download={download} onClick={onClick} className={cls} whileTap={tap}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} onClick={onClick} className={cls} whileTap={tap}>
      {children}
    </motion.button>
  );
}
