"use client";

// ─────────────────────────────────────────────────────────────────────────────
// WaterEntryEffect — postprocessing Effect that fires when the camera crosses
// the water surface (Y=0 downward).
//
// On entry it applies three layered effects that decay over ~1.5 s:
//   1. Screen-space ripple distortion (concentric shockwave from center)
//   2. Chromatic aberration (R pushed outward, B pulled inward)
//   3. Blue vignette flash (center-weighted surge of light)
// ─────────────────────────────────────────────────────────────────────────────

import { Effect } from "postprocessing";
import { Uniform } from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

const fragmentShader = /* glsl */ `
uniform float uSubmergeAge;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float age      = uSubmergeAge;
  float strength = exp(-age * 5.5);   // punchy onset, gone by ~0.6 s
  if (strength < 0.002) {
    outputColor = inputColor;
    return;
  }

  // Dive-direction motion blur: smear frame upward (sky rushes up as camera plunges).
  // Sampling from below (lower Y) and blending into current pixel makes content
  // appear to streak upward — same direction as the dive camera movement.
  // A slight horizontal sway breaks the purely uniform vertical streak.
  float spread = strength * 0.14;
  float sway   = sin(uv.x * 3.5 - age * 9.0) * strength * 0.012;

  vec3 c0 = texture2D(inputBuffer, clamp(uv, 0.001, 0.999)).rgb;
  vec3 c1 = texture2D(inputBuffer, clamp(vec2(uv.x + sway * 0.4, uv.y - spread * 0.4), 0.001, 0.999)).rgb;
  vec3 c2 = texture2D(inputBuffer, clamp(vec2(uv.x + sway * 0.7, uv.y - spread * 0.9), 0.001, 0.999)).rgb;
  vec3 c3 = texture2D(inputBuffer, clamp(vec2(uv.x + sway,       uv.y - spread * 1.5), 0.001, 0.999)).rgb;

  vec3 col = c0 * 0.42 + c1 * 0.30 + c2 * 0.18 + c3 * 0.10;

  outputColor = vec4(col, inputColor.a);
}
`;

class WaterEntryEffectImpl extends Effect {
  constructor() {
    super("WaterEntryEffect", fragmentShader, {
      uniforms: new Map([["uSubmergeAge", new Uniform(9999)]]),
    });
  }
}

export default function WaterEntryEffect() {
  const effect = useMemo(() => new WaterEntryEffectImpl(), []);
  const lastCamY      = useRef<number | null>(null);
  const crossingTime  = useRef<number | null>(null);

  useFrame(({ clock, camera }) => {
    const camY = camera.position.y;

    // Detect downward crossing of Y = 0
    if (lastCamY.current !== null && lastCamY.current >= 0 && camY < 0) {
      crossingTime.current = clock.elapsedTime;
    }
    lastCamY.current = camY;

    const age = crossingTime.current !== null
      ? clock.elapsedTime - crossingTime.current
      : 9999;

    (effect.uniforms.get("uSubmergeAge") as Uniform).value = age;
  });

  return <primitive object={effect} />;
}
