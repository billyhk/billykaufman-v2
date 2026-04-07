"use client";

import { useEffect, useRef, useState } from "react";
import type { BannerSize } from "@/data/projects";

const PREVIEW_H = 280;

export default function BannerShowcase({ banners }: { banners: BannerSize[] }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const banner = banners[active];
  const scale = Math.min(containerW / banner.width, PREVIEW_H / banner.height, 1.5);
  const previewH = Math.min(Math.ceil(banner.height * scale) + 40, PREVIEW_H);

  return (
    <div>
      {/* Size tabs */}
      <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 border-b border-white/8">
        {banners.map((b, i) => (
          <button
            key={b.label}
            onClick={() => setActive(i)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
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
        style={{ height: previewH }}
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
            key={banner.src}
            src={banner.src}
            width={banner.width}
            height={banner.height}
            scrolling="no"
            style={{ border: "none", display: "block", overflow: "hidden", background: "transparent" }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
