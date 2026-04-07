"use client";

import { useEffect, useState } from "react";
import { GRADIENT_PROGRESS } from "@/constants/colors";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? el.scrollTop / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[5] z-100 bg-white/5">
      <div
        className="h-full"
        style={{
          width: `${progress * 100}%`,
          background: GRADIENT_PROGRESS,
          transition: "width 60ms linear",
        }}
      />
    </div>
  );
}
