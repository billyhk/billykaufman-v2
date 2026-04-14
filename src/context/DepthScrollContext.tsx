"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { motionValue, MotionValue, useMotionValueEvent, useScroll } from "framer-motion";

interface DepthScrollCtx {
  scrollYProgress: MotionValue<number>;
  freeze: (at?: number) => void;
  unfreeze: () => void;
}

const DepthScrollContext = createContext<DepthScrollCtx | null>(null);

// Wraps the full app. Provides a shared scrollYProgress MotionValue that all
// depth-reading components subscribe to. Can be frozen (e.g. while ProjectsGallery
// is active) so the depth display holds steady while the user browses projects.
export default function DepthScrollProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress: rawProgress } = useScroll();

  const displayProgress = useMemo(() => motionValue(0), []);
  const frozenRef = useRef(false);

  // Sync to actual scroll before the first paint — avoids any post-mount flicker.
  useLayoutEffect(() => {
    displayProgress.set(rawProgress.get());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep displayProgress in sync with page scroll when not frozen.
  useMotionValueEvent(rawProgress, "change", (v) => {
    if (!frozenRef.current) displayProgress.set(v);
  });

  const freeze = useCallback((at?: number) => {
    frozenRef.current = true;
    if (at !== undefined) displayProgress.set(at);
  }, [displayProgress]);

  const unfreeze = useCallback(() => {
    frozenRef.current = false;
    displayProgress.set(rawProgress.get());
  }, [rawProgress, displayProgress]);

  const value = useMemo(
    () => ({ scrollYProgress: displayProgress, freeze, unfreeze }),
    [displayProgress, freeze, unfreeze],
  );

  return <DepthScrollContext.Provider value={value}>{children}</DepthScrollContext.Provider>;
}

/** Drop-in replacement for `useScroll()` in depth-reading components. */
export function useDepthScroll(): { scrollYProgress: MotionValue<number> } {
  const ctx = useContext(DepthScrollContext);
  if (!ctx) throw new Error("useDepthScroll must be inside DepthScrollProvider");
  return { scrollYProgress: ctx.scrollYProgress };
}

/** Used by components that need to pause depth tracking.
 *  freeze(at?) — pass a page-level progress value to pin to, or omit to hold current. */
export function useDepthFreeze() {
  const ctx = useContext(DepthScrollContext);
  if (!ctx) throw new Error("useDepthFreeze must be inside DepthScrollProvider");
  return { freeze: ctx.freeze, unfreeze: ctx.unfreeze };
}
