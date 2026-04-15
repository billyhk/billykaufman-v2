import { useState, useEffect } from "react";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";

/**
 * Returns true once the HUD should animate into view.
 *
 * HudLayer only mounts when phase === "underwater", so by the time this hook
 * runs, the visitor has already dived in. We wait INTRO_TOTAL seconds to let
 * the fish intro animation play before the HUD panels slide in.
 *
 * Touch devices skip the fish intro, so they show the HUD immediately.
 */
export function useHudVisible(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      setShow(true);
      return;
    }
    const t = setTimeout(() => setShow(true), INTRO_TOTAL * 1000);
    return () => clearTimeout(t);
  }, []);
  return show;
}
