import { useState, useEffect } from "react";
import { INTRO_TOTAL } from "@/components/ocean/HeroElements";

/**
 * Returns true once the HUD should be visible.
 * If the intro animation will play, waits for it to finish.
 * If the page is already scrolled past the hero, shows immediately.
 * Use this everywhere instead of duplicating the INTRO_TOTAL timeout logic.
 */
export function useHudVisible(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.scrollY > window.innerHeight * 0.5) {
      setShow(true);
      return;
    }
    const t = setTimeout(() => setShow(true), INTRO_TOTAL * 1000);
    return () => clearTimeout(t);
  }, []);
  return show;
}
