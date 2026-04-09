"use client";

import { useEffect, useState } from "react";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";

/**
 * Blocks all user interaction (scroll, mouse, keyboard scroll) for the
 * duration of the fish intro animation. No-ops when page loads mid-scroll.
 */
export default function IntroLock() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.scrollY > 10) return; // already mid-scroll — skip

    setActive(true);
    document.documentElement.style.overflow = "hidden"; // blocks all scroll incl. keyboard
    document.body.dataset.introLocked = "1"; // signals window-level listeners to ignore real mouse events

    const timer = setTimeout(() => {
      setActive(false);
      document.documentElement.style.overflow = "";
      delete document.body.dataset.introLocked;
    }, INTRO_TOTAL * 1000);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = "";
      delete document.body.dataset.introLocked;
    };
  }, []);

  if (!active) return null;

  // Full-screen transparent overlay absorbs all pointer events (hover, click, select)
  return <div className="fixed inset-0" style={{ zIndex: 99999, cursor: "none" }} />;
}
