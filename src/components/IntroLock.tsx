"use client";

import { useEffect, useRef, useState } from "react";
import { useScenePhase } from "@/context/ScenePhaseContext";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";

/**
 * Blocks pointer events (and optionally scroll) for the duration of the fish
 * intro animation, starting the moment the visitor enters the underwater phase.
 *
 * Unlike the old version, this no longer fires on page load — the ScenePhaseContext
 * already holds scroll during the surface/diving phases. This lock specifically
 * covers the INTRO_TOTAL window after the camera arrives underwater.
 */
export default function IntroLock() {
  const { phase } = useScenePhase();
  const [active, setActive] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (phase !== "underwater" || triggered.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    triggered.current = true;
    setActive(true);
    document.documentElement.style.overflow = "hidden";
    document.body.dataset.introLocked = "1";

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
  }, [phase]);

  if (!active) return null;

  return <div className="fixed inset-0" style={{ zIndex: 99999, cursor: "none" }} />;
}
