"use client";

import { useEffect, useRef, useState } from "react";
import type { BannerSize } from "@/data/projects";

const MOBILE_PREVIEW_H = 180;

// Approximate available preview height on desktop:
// container = clamp(600px, 78svh, 820px), minus p-10 padding (80px),
// brackets (18px), tabs (~50px), status bar (~28px) = ~176px overhead.
function calcDesktopPreviewH() {
  const containerH = Math.min(Math.max(window.innerHeight * 0.78, 600), 820);
  return Math.max(containerH - 200, 300);
}

export default function BannerShowcase({ banners }: { banners: BannerSize[] }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(400);
  const [isMobile, setIsMobile] = useState(true);
  const [desktopPreviewH, setDesktopPreviewH] = useState(500);
  const [revision, setRevision] = useState(0);
  const hasEntered = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMobile(!mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const update = () => setDesktopPreviewH(calcDesktopPreviewH());
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Don't load the iframe until the showcase scrolls into view
  useEffect(() => {
    const el = containerRef.current?.closest("[data-banner-root]") as HTMLElement | null;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasEntered.current) {
        hasEntered.current = true;
        setRevision(r => r + 1);
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const go = (dir: 1 | -1) => {
    setActive(i => (i + dir + banners.length) % banners.length);
    setRevision(r => r + 1);
  };

  const select = (i: number) => {
    setActive(i);
    setRevision(r => r + 1);
  };

  const banner = banners[active];

  // Mobile: scale to fit fixed-height box.
  // Desktop: show at 1:1 (no upscale) but constrain to available container height so
  // tall banners (160×600) don't overflow on shorter/wider screens.
  const scale = isMobile
    ? Math.min(containerW / banner.width, MOBILE_PREVIEW_H / banner.height, 1.5)
    : Math.min(containerW / banner.width, desktopPreviewH / banner.height, 1);
  const previewH = isMobile
    ? Math.min(Math.ceil(banner.height * scale) + 40, MOBILE_PREVIEW_H)
    : Math.min(Math.ceil(banner.height * scale) + 40, desktopPreviewH);

  return (
    <div data-banner-root>
      {isMobile ? (
        /* ── Mobile: carousel ─────────────────────────────────── */
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-black/20 border-b border-white/8">
          <button
            onClick={() => go(-1)}
            className="text-white/40 hover:text-white/70 transition-colors cursor-pointer text-xs px-1"
            aria-label="Previous size"
          >←</button>
          <span className="font-mono text-xs text-blue-300 tracking-wider">
            {banner.label}
            <span className="text-white/25 ml-2">{active + 1}/{banners.length}</span>
          </span>
          <button
            onClick={() => go(1)}
            className="text-white/40 hover:text-white/70 transition-colors cursor-pointer text-xs px-1"
            aria-label="Next size"
          >→</button>
        </div>
      ) : (
        /* ── Desktop: multi-row tabs ──────────────────────────── */
        <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 border-b border-white/8">
          {banners.map((b, i) => (
            <button
              key={b.label}
              onClick={() => select(i)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                i === active
                  ? "bg-blue-500/30 text-blue-300 border border-blue-500/40"
                  : "text-white/40 hover:text-white/70 border border-transparent"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* Scaled iframe preview */}
      <div
        ref={containerRef}
        className="relative bg-black flex items-center justify-center overflow-hidden transition-[height] duration-300"
        style={{ height: previewH, cursor: "default" }}
      >
        <div
          style={{
            width: banner.width,
            height: banner.height,
            transform: `scale(${scale})`,
            transformOrigin: "center",
            flexShrink: 0,
          }}
        >
          <iframe
            key={`${banner.src}-${revision}`}
            src={revision > 0 ? banner.src : "about:blank"}
            width={banner.width}
            height={banner.height}
            scrolling="no"
            style={{ border: "none", display: "block", overflow: "hidden", background: "transparent" }}
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Transparent overlay so parent document keeps receiving mousemove events,
              preventing the fish cursor from freezing when entering the iframe */}
          <div style={{ position: "absolute", inset: 0, cursor: "default" }} />
        </div>
      </div>
    </div>
  );
}
