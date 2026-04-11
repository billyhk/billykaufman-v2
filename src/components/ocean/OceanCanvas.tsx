"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import OceanScene from "./OceanScene";

export default function OceanCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // Use visualViewport when available — it reports the actual visible area
    // on iOS Safari regardless of browser chrome state. Falls back to innerHeight.
    const setHeight = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      el.style.height = `${h}px`;
    };

    setHeight();

    // Debounce visualViewport updates — it fires continuously during iOS address-bar
    // hide animation (triggered by first scroll), causing layout shifts that spring-back.
    // We wait until the animation settles before resizing the canvas.
    let debounce: ReturnType<typeof setTimeout>;
    const onViewportResize = () => {
      clearTimeout(debounce);
      debounce = setTimeout(setHeight, 200);
    };

    window.visualViewport?.addEventListener("resize", onViewportResize);
    window.addEventListener("resize", setHeight); // orientation changes — update immediately
    return () => {
      clearTimeout(debounce);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  return (
    <motion.div
      ref={wrapperRef}
      className="fixed inset-x-0 top-0 z-0 pointer-events-none"
      style={{ height: "100dvh" }} // dvh as CSS baseline; JS overrides on iOS
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
