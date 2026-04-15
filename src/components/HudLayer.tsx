"use client";

// Renders all HUD overlay components once the visitor has dived underwater.
// Nothing is mounted during the surface / diving phases.

import { useScenePhase } from "@/context/ScenePhaseContext";
import NavBar from "@/components/NavBar";
import DepthGauge from "@/components/ocean/DepthGauge";
import HudSensorPanel from "@/components/ocean/HudSensorPanel";
import HudBottomBar from "@/components/ocean/HudBottomBar";
import HudBrackets from "@/components/HudBrackets";
import ScrollHint from "@/components/ScrollHint";

export default function HudLayer() {
  const { phase } = useScenePhase();
  if (phase !== "underwater") return null;

  return (
    <>
      <NavBar />
      <DepthGauge />
      <HudSensorPanel />
      <HudBottomBar />
      <HudBrackets />
      <ScrollHint />
    </>
  );
}
