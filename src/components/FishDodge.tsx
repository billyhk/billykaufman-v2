"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const H             = 130;        // canvas height (px)
const FISH_X        = 70;         // fish fixed x position
const FISH_R        = 10;         // fish collision radius
const GRAVITY       = 0.045;
const FLAP_V        = -1.8;       // upward velocity on click/space
const INIT_SPEED    = 2.8;
const SPEED_INC     = 0.00012;    // added to speed each frame
const PIPE_W        = 18;
const GAP           = 58;         // gap between top & bottom obstacle
const PIPE_INTERVAL = 210;        // px between obstacles
const PIPE_MIN_TOP  = 22;         // min top obstacle height
const SCORE_INTERVAL = 60;        // frames per score tick

// ── Types ─────────────────────────────────────────────────────────────────────
type GameState = "idle" | "playing" | "dead";

type Pipe = {
  x: number;
  gapY: number; // center of gap
};

// ── Fish drawing ──────────────────────────────────────────────────────────────
function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, vy: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  // Tilt with velocity
  ctx.rotate(Math.max(-0.5, Math.min(0.5, vy * 0.07)));

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#f97316";
  ctx.fill();

  // White stripes
  for (const sx of [-4, 3]) {
    ctx.beginPath();
    ctx.ellipse(sx, 0, 2.5, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fill();
  }

  // Tail
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(-20, -8);
  ctx.lineTo(-20, 8);
  ctx.closePath();
  ctx.fillStyle = "#f97316";
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(9, -2, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(9.8, -2.5, 1, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FishDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state     = useRef<GameState>("idle");
  const fishY     = useRef(H / 2);
  const fishVY    = useRef(0);
  const pipes     = useRef<Pipe[]>([]);
  const speed     = useRef(INIT_SPEED);
  const score     = useRef(0);
  const frames    = useRef(0);
  const rafRef    = useRef(0);
  const W         = useRef(800);

  const reset = useCallback(() => {
    fishY.current  = H / 2;
    fishVY.current = 0;
    pipes.current  = [];
    speed.current  = INIT_SPEED;
    score.current  = 0;
    frames.current = 0;
  }, []);

  const flap = useCallback(() => {
    if (state.current === "idle") {
      // Start game without applying flap — fish falls from center,
      // player learns to click to swim up
      reset();
      state.current = "playing";
    } else if (state.current === "playing") {
      fishVY.current = FLAP_V;
    } else if (state.current === "dead") {
      reset();
      state.current = "playing";
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const setSize = () => {
      W.current = canvas.offsetWidth;
      canvas.width  = Math.round(W.current * dpr);
      canvas.height = Math.round(H * dpr);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    const ctx = canvas.getContext("2d")!;

    // Spacebar
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); flap(); }
    };
    window.addEventListener("keydown", onKey);

    const tick = () => {
      const cw = W.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // ── Background ───────────────────────────────────────────────────────
      ctx.fillStyle = "rgb(1, 4, 16)";
      ctx.fillRect(0, 0, cw, H);

      // Seabed line
      ctx.strokeStyle = "rgba(103,232,249,0.12)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(0, H - 1); ctx.lineTo(cw, H - 1);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Game logic ────────────────────────────────────────────────────────
      if (state.current === "playing") {
        frames.current++;
        speed.current += SPEED_INC;

        // Score every N frames
        if (frames.current % SCORE_INTERVAL === 0) score.current++;

        // Physics
        fishVY.current += GRAVITY;
        fishY.current  += fishVY.current;

        // Ceiling / floor
        if (fishY.current - FISH_R <= 0 || fishY.current + FISH_R >= H) {
          state.current = "dead";
        }

        // Spawn pipes
        const lastPipe = pipes.current[pipes.current.length - 1];
        if (!lastPipe || lastPipe.x < cw - PIPE_INTERVAL) {
          const minGapCenter = PIPE_MIN_TOP + GAP / 2;
          const maxGapCenter = H - PIPE_MIN_TOP - GAP / 2;
          pipes.current.push({
            x:    cw + PIPE_W,
            gapY: minGapCenter + Math.random() * (maxGapCenter - minGapCenter),
          });
        }

        // Move & cull pipes
        pipes.current = pipes.current.filter(p => p.x > -PIPE_W);
        for (const p of pipes.current) {
          p.x -= speed.current;

          // Collision
          const nearX = Math.abs(FISH_X - p.x) < FISH_R + PIPE_W / 2;
          const inGap  = fishY.current > p.gapY - GAP / 2 && fishY.current < p.gapY + GAP / 2;
          if (nearX && !inGap) state.current = "dead";
        }
      }

      // ── Draw pipes ────────────────────────────────────────────────────────
      for (const p of pipes.current) {
        const topH    = p.gapY - GAP / 2;
        const botY    = p.gapY + GAP / 2;
        const botH    = H - botY;
        const isLive  = state.current !== "dead";
        const pipeCol = isLive ? "rgba(14,116,144,0.9)" : "rgba(14,116,144,0.4)";
        const capCol  = isLive ? "rgba(21,148,180,0.95)" : "rgba(21,148,180,0.4)";

        // Top pipe
        ctx.fillStyle = pipeCol;
        ctx.fillRect(p.x - PIPE_W / 2, 0, PIPE_W, topH);
        ctx.fillStyle = capCol;
        ctx.fillRect(p.x - PIPE_W / 2 - 3, topH - 8, PIPE_W + 6, 8);

        // Bottom pipe
        ctx.fillStyle = pipeCol;
        ctx.fillRect(p.x - PIPE_W / 2, botY, PIPE_W, botH);
        ctx.fillStyle = capCol;
        ctx.fillRect(p.x - PIPE_W / 2 - 3, botY, PIPE_W + 6, 8);
      }

      // ── Draw fish ─────────────────────────────────────────────────────────
      const fishAlpha = state.current === "dead" ? 0.4 : 1;
      drawFish(ctx, FISH_X, fishY.current, fishVY.current, fishAlpha);

      // ── HUD ───────────────────────────────────────────────────────────────
      ctx.font      = "bold 13px monospace";
      ctx.textAlign = "right";

      if (state.current === "playing" || state.current === "dead") {
        ctx.fillStyle = "rgba(103,232,249,0.7)";
        ctx.fillText(`${score.current}`, cw - 12, 20);
      }

      // Overlay messages
      if (state.current === "idle" || state.current === "dead") {
        ctx.textAlign   = "center";
        ctx.fillStyle   = "rgba(255,255,255,0.85)";
        ctx.font        = "bold 13px monospace";
        const msg = state.current === "idle" ? "Click or Space to swim" : `Game over  —  score ${score.current}  —  click to retry`;
        ctx.fillText(msg, cw / 2, H / 2 + 5);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      ro.disconnect();
    };
  }, [flap]);

  return (
    <div
      className="w-full border-t border-white/8 cursor-pointer select-none"
      onClick={flap}
      title="Click or press Space to play"
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: H, display: "block" }}
      />
    </div>
  );
}
