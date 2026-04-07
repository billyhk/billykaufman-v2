// ── Primary accent palette ────────────────────────────────────────────────────
// These two colors define the portfolio's blue-purple identity and appear
// across scroll progress, OG image, hero particles, and text gradients.
export const ACCENT_BLUE   = "#93c5fd"; // blue-300
export const ACCENT_PURPLE = "#c4b5fd"; // purple-300

// ── Category / section accent colors ─────────────────────────────────────────
// Shared between SkillsSection CATEGORY_COLORS and TOOL_COLORS maps.
export const CAT_BLUE   = "#3b82f6"; // blue-500   — Frontend, IDE
export const CAT_GREEN  = "#10b981"; // emerald-500 — Backend, Version Control
export const CAT_ORANGE = "#f97316"; // orange-500  — Cloud & DevOps, Project Mgmt
export const CAT_PURPLE = "#a855f7"; // purple-500  — AI & Modern Tooling, Design
export const CAT_YELLOW = "#eab308"; // yellow-500  — Testing
export const CAT_CYAN   = "#06b6d4"; // cyan-500    — Documentation

// ── Gradients ─────────────────────────────────────────────────────────────────
export const GRADIENT_PROGRESS = `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE}, ${ACCENT_BLUE})`;
export const GRADIENT_SHIMMER  = `linear-gradient(90deg, #fff 0%, ${ACCENT_BLUE} 40%, ${ACCENT_PURPLE} 70%, ${ACCENT_BLUE} 100%)`;
export const GRADIENT_OG_BG    = "linear-gradient(135deg, #020a1e 0%, #01040f 60%, #050d1a 100%)";
export const GRADIENT_VIGNETTE = "radial-gradient(ellipse at center, transparent 40%, rgba(2,8,23,0.6) 100%)";

// ── Dark backgrounds ──────────────────────────────────────────────────────────
export const DARK_MODAL_BG = "rgba(10, 18, 35, 0.98)";  // ClientsGrid modal, experience logo fallback
export const DARK_LOGO_BG  = "rgba(15, 23, 42, 0.8)";   // timeline logo dot background

// ── Hero particle canvas palette ──────────────────────────────────────────────
export const PARTICLE_COLORS = [
  "rgba(255, 255, 255, 0.92)",
  "rgba(147, 197, 253, 0.92)",
  "rgba(196, 181, 253, 0.92)",
] as const;

// ── Canvas mini-game shared UI colors ────────────────────────────────────────
export const GAME_BG_TOP          = "rgb(2, 10, 30)";
export const GAME_BG_BOTTOM       = "rgb(1, 4, 16)";
export const GAME_BUBBLE_DIM      = "rgba(103, 232, 249, 0.06)";
export const GAME_HUD_CYAN        = "rgba(103, 232, 249, 0.7)";
export const GAME_OVERLAY         = "rgba(0, 0, 0, 0.5)";
export const GAME_DEATH_TEXT      = "rgba(255, 255, 255, 0.9)";
export const GAME_DEATH_SUBTEXT   = "rgba(255, 255, 255, 0.5)";
