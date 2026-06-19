"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ScenePhaseContext — controls the three-phase visitor flow:
//
//   "surface"     Camera above water. Scroll locked. Only "Dive In" visible.
//   "diving"      Camera animating downward. Scroll still locked.
//   "underwater"  Full experience. Scroll enabled. HUD + content revealed.
//
// phaseRef mirrors `phase` but as a stable ref, so useFrame callbacks can read
// the latest value without stale closures.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

export type ScenePhase = "surface" | "diving" | "underwater";

interface ScenePhaseContextValue {
  phase: ScenePhase;
  /** Stable ref — always reflects current phase. Safe to read inside useFrame. */
  phaseRef: React.RefObject<ScenePhase>;
  /** Camera Y recorded at the end of the dive animation. */
  diveEndCamYRef: React.MutableRefObject<number>;
  /**
   * Flipped to true by OceanScene inside the rAF that sets scroll position after
   * diving. The fish intro waits for this before capturing its start time, so the
   * animation always begins from a stable scroll/camera position.
   */
  scrollReadyRef: React.MutableRefObject<boolean>;
  startDive: () => void;
  /** Called by OceanScene once the dive animation has fully completed. */
  markUnderwater: (camY: number) => void;
}

const ScenePhaseContext = createContext<ScenePhaseContextValue>(null!);

export function ScenePhaseProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<ScenePhase>("surface");
  const phaseRef       = useRef<ScenePhase>("surface");
  const diveEndCamYRef = useRef<number>(-2);
  const scrollReadyRef = useRef<boolean>(false);

  // Keep phaseRef in sync with React state
  const setPhase = useCallback((p: ScenePhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  // Lock scroll during surface + diving; unlock when underwater.
  // IntroLock takes over the underwater scroll lock for the fish intro duration.
  useEffect(() => {
    if (phase === "underwater") {
      document.documentElement.style.overflow = "";
    } else {
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  const startDive = useCallback(() => setPhase("diving"), [setPhase]);

  const markUnderwater = useCallback(
    (camY: number) => {
      diveEndCamYRef.current = camY;
      setPhase("underwater");
    },
    [setPhase],
  );

  return (
    <ScenePhaseContext.Provider value={{ phase, phaseRef, diveEndCamYRef, scrollReadyRef, startDive, markUnderwater }}>
      {children}
    </ScenePhaseContext.Provider>
  );
}

export function useScenePhase() {
  return useContext(ScenePhaseContext);
}
