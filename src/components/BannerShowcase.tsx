"use client";

import { useEffect, useRef, useState } from "react";
import type { BannerSize } from "@/data/projects";

const PREVIEW_H = 280;

export default function BannerShowcase({ banners }: { banners: BannerSize[] }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(400);
  // Increment to reload the iframe (restarts the animation)
  const [revision, setRevision] = useState(0);
  const hasEntered = useRef(false);

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

  const banner = banners[active];
  const scale = Math.min(containerW / banner.width, PREVIEW_H / banner.height, 1.5);
  const previewH = Math.min(Math.ceil(banner.height * scale) + 40, PREVIEW_H);

  return (
    <div data-banner-root>
      {/* Size tabs */}
      <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 border-b border-white/8">
        {banners.map((b, i) => (
          <button
            key={b.label}
            onClick={() => { setActive(i); setRevision(r => r + 1); }}
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
