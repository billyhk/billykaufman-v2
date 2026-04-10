"use client";

import { ReactNode } from "react";

/**
 * Establishes a shared CSS 3D perspective context for all sections.
 * Without this parent-level perspective, each section would have its own
 * vanishing point and the space feels disconnected.
 */
export default function ScrollStage({ children }: { children: ReactNode }) {
  return (
    <main
      className="relative z-10"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 0px" }}
    >
      {children}
    </main>
  );
}
