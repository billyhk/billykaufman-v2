"use client";

// Renders portfolio content sections only after the visitor has dived underwater.
// Keeps the DOM clear during the surface / diving phases (no content = no scroll height).

import { useScenePhase } from "@/context/ScenePhaseContext";

export default function ContentGate({ children }: { children: React.ReactNode }) {
  const { phase } = useScenePhase();
  if (phase !== "underwater") return null;
  return <>{children}</>;
}
