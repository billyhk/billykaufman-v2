import { ImageResponse } from "next/og";
import { ACCENT_BLUE, GRADIENT_OG_BG, GRADIENT_SHIMMER } from "@/constants/colors";

export const runtime = "edge";
export const alt = "Billy Kaufman — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: GRADIENT_OG_BG,
          padding: "80px",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow circles */}
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(147,197,253,0.07) 0%, transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -80, left: 200, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,181,253,0.06) 0%, transparent 70%)", display: "flex" }} />

        {/* Depth label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            billyhkaufman.com
          </span>
        </div>

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
          <span style={{ fontSize: 100, fontWeight: 800, lineHeight: 1.0, background: GRADIENT_SHIMMER, backgroundClip: "text", color: "transparent" }}>
            Billy
          </span>
          <span style={{ fontSize: 100, fontWeight: 800, lineHeight: 1.0, background: GRADIENT_SHIMMER, backgroundClip: "text", color: "transparent" }}>
            Kaufman
          </span>
        </div>

        {/* Title */}
        <span style={{ fontSize: 28, color: ACCENT_BLUE, fontWeight: 500, letterSpacing: "0.02em" }}>
          Software Engineer · NYC
        </span>

        {/* Tech tags */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["TypeScript", "React", "Next.js", "Python", "AWS"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid rgba(147,197,253,0.25)",
                background: "rgba(147,197,253,0.08)",
                color: ACCENT_BLUE,
                fontSize: 16,
                display: "flex",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
