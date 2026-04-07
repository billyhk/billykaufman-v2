"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const H             = 130;
const FISH_X        = 80;
const FISH_R        = 10;
const LERP          = 0.10;       // how fast fish follows cursor (0–1)
const INIT_SPEED    = 2.2;
const SPEED_INC     = 0.00007;
const PIPE_W        = 22;
const GAP           = 60;
const PIPE_INTERVAL = 240;
const PIPE_MIN_TOP  = 18;
const SCORE_INTERVAL = 60;        // frames per score point

type GameState = "idle" | "playing" | "dead";
type Pipe = { x: number; gapY: number };

// ── Fish drawing ──────────────────────────────────────────────────────────────
function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, vy: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(Math.max(-0.45, Math.min(0.45, vy * 0.25)));

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
  ctx.lineTo(-20,  8);
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

// ── Coral drawing ─────────────────────────────────────────────────────────────
function drawCoral(ctx: CanvasRenderingContext2D, x: number, topH: number, botY: number, canvasH: number, live: boolean) {
  const col = live ? "rgba(20,130,150,0.9)"  : "rgba(20,130,150,0.35)";
  const cap = live ? "rgba(34,180,190,0.95)" : "rgba(34,180,190,0.35)";

  // Top block
  ctx.fillStyle = col;
  ctx.fillRect(x - PIPE_W / 2, 0, PIPE_W, topH);
  ctx.fillStyle = cap;
  ctx.fillRect(x - PIPE_W / 2 - 3, topH - 8, PIPE_W + 6, 8);

  // Bottom block
  ctx.fillStyle = col;
  ctx.fillRect(x - PIPE_W / 2, botY, PIPE_W, canvasH - botY);
  ctx.fillStyle = cap;
  ctx.fillRect(x - PIPE_W / 2 - 3, botY, PIPE_W + 6, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CoralSlalom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GameState>("idle");
  const fishY     = useRef(H / 2);
  const targetY   = useRef(H / 2);
  const fishVY    = useRef(0);
  const pipes     = useRef<Pipe[]>([]);
  const speed     = useRef(INIT_SPEED);
  const score     = useRef(0);
  const frames    = useRef(0);
  const rafRef    = useRef(0);
  const W         = useRef(800);
  const scoreDisplayRef = useRef(0);

  const reset = useCallback(() => {
    fishY.current    = H / 2;
    targetY.current  = H / 2;
    fishVY.current   = 0;
    pipes.current    = [];
    speed.current    = INIT_SPEED;
    score.current    = 0;
    frames.current   = 0;
    scoreDisplayRef.current = 0;
  }, []);

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

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      targetY.current = Math.max(FISH_R + 4, Math.min(H - FISH_R - 4, y));
      if (stateRef.current === "idle") {
        reset();
        fishY.current = targetY.current;
        stateRef.current = "playing";
      }
    };

    const onClick = () => {
      if (stateRef.current === "dead") {
        reset();
        stateRef.current = "playing";
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);

    const ctx = canvas.getContext("2d")!;

    const tick = () => {
      const cw = W.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = "rgb(1, 4, 16)";
      ctx.fillRect(0, 0, cw, H);

      // Subtle sonar grid
      ctx.strokeStyle = "rgba(103,232,249,0.04)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 60) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 60) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke();
      }

      // ── Game logic ──────────────────────────────────────────────────────
      if (stateRef.current === "playing") {
        frames.current++;
        speed.current += SPEED_INC;

        if (frames.current % SCORE_INTERVAL === 0) {
          score.current++;
          scoreDisplayRef.current = score.current;
        }

        // Lerp fish toward mouse
        const prevY = fishY.current;
        fishY.current += (targetY.current - fishY.current) * LERP;
        fishVY.current = fishY.current - prevY;

        // Spawn pipes
        const last = pipes.current[pipes.current.length - 1];
        if (!last || last.x < cw - PIPE_INTERVAL) {
          const min = PIPE_MIN_TOP + GAP / 2;
          const max = H - PIPE_MIN_TOP - GAP / 2;
          pipes.current.push({
            x:    cw + PIPE_W,
            gapY: min + Math.random() * (max - min),
          });
        }

        pipes.current = pipes.current.filter(p => p.x > -PIPE_W - 10);
        for (const p of pipes.current) {
          p.x -= speed.current;
          const nearX = Math.abs(FISH_X - p.x) < FISH_R + PIPE_W / 2;
          const inGap = fishY.current > p.gapY - GAP / 2 && fishY.current < p.gapY + GAP / 2;
          if (nearX && !inGap) stateRef.current = "dead";
        }
      }

      // ── Draw coral ──────────────────────────────────────────────────────
      for (const p of pipes.current) {
        drawCoral(ctx, p.x, p.gapY - GAP / 2, p.gapY + GAP / 2, H, stateRef.current !== "dead");
      }

      // ── Draw fish ───────────────────────────────────────────────────────
      drawFish(ctx, FISH_X, fishY.current, fishVY.current, stateRef.current === "dead" ? 0.35 : 1);

      // ── HUD ─────────────────────────────────────────────────────────────
      ctx.font      = "bold 12px monospace";
      ctx.textAlign = "right";

      if (stateRef.current === "playing") {
        ctx.fillStyle = "rgba(103,232,249,0.65)";
        ctx.fillText(`${scoreDisplayRef.current}`, cw - 12, 18);
      }

      if (stateRef.current === "idle") {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font      = "13px monospace";
        ctx.fillText("Move your cursor to swim", cw / 2, H / 2 + 5);
      }

      if (stateRef.current === "dead") {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font      = "bold 13px monospace";
        ctx.fillText(`Score: ${scoreDisplayRef.current}  —  click to retry`, cw / 2, H / 2 + 5);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      ro.disconnect();
    };
  }, [reset]);

  return (
    <div className="w-full border-t border-white/8 select-none">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: H, display: "block" }}
      />
    </div>
  );
}
