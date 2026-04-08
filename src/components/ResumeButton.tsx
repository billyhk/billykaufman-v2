"use client";

import { useState, useEffect, useCallback } from "react";
import { RESUME_URL } from "@/data/bio";

const fileId = RESUME_URL.match(/\/d\/([^/]+)/)?.[1] ?? "";
const EMBED_URL = `https://drive.google.com/file/d/${fileId}/preview`;

export default function ResumeButton() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-cta px-5 py-2.5 font-semibold rounded-lg text-sm"
      >
        View Resume
      </button>

      {open && (
        /* cursor:auto overrides the fish-cursor's body{cursor:none} inside the modal */
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
          style={{ cursor: "auto" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-3xl h-[88vh] bg-slate-900 rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
              <span className="text-white/70 text-sm font-medium">Billy Kaufman — Resume</span>
              <div className="flex items-center gap-3">
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={close}
                  className="text-white/50 hover:text-white transition-colors text-lg leading-none"
                  aria-label="Close resume"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* PDF viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={EMBED_URL}
                className="w-full h-full border-0"
                title="Billy Kaufman Resume"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
