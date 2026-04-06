"use client";

export default function DepthLabel({ depth }: { depth: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-8 select-none">
      <div className="w-8 h-px bg-white/20" />
      <span className="text-white/25 text-xs tracking-widest uppercase font-mono">{depth} depth</span>
    </div>
  );
}
