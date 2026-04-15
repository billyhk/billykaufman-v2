"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { motion } from "framer-motion";
import OceanScene from "./OceanScene";

export default function OceanCanvas() {
  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ touchAction: "pan-y" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
    >
      <Canvas
        camera={{ position: [0, 5, 5], fov: 70, near: 0.1, far: 200 }}
        onCreated={({ camera }) => camera.lookAt(0, 5, -10)}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: "none", touchAction: "pan-y" }}
      >
        <Suspense fallback={null}>
          <OceanScene />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
