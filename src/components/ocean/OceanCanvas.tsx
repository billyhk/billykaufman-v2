"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { motion } from "framer-motion";
import OceanScene from "./OceanScene";

export default function OceanCanvas() {
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-0 pointer-events-none"
      style={{ height: "100dvh" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <OceanScene />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
