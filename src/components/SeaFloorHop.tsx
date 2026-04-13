"use client";

import { useEffect, useRef, useCallback } from "react";
import { GAME_BG_TOP, GAME_BG_BOTTOM, GAME_BUBBLE_DIM, GAME_HUD_CYAN, GAME_OVERLAY, GAME_DEATH_TEXT, GAME_DEATH_SUBTEXT } from "@/constants/colors";

// ── Constants ─────────────────────────────────────────────────────────────────
const H             = 200;
const FISH_X        = 72;
const FISH_R        = 11;
const FLOOR_Y       = H - 36;
const GRAVITY       = 0.13;
const JUMP_V        = -4.2;
const INIT_SPEED    = 3.2;
const SPEED_INC     = 0.00009;
const SCORE_INTERVAL = 55; // frames per point

// type 0=crab  1=urchin  2=starfish  3=hermit
type ObsType = 0 | 1 | 2 | 3;

type GameState = "idle" | "playing" | "dead";
type Obstacle  = { x: number; type: ObsType };

// ── Fish ──────────────────────────────────────────────────────────────────────
function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, vy: number, t: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(Math.max(-0.45, Math.min(0.45, vy * 0.09)));

  const tailWag = Math.sin(t * 9) * 0.28;

  // Body
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#f97316"; ctx.fill();
  // Stripes
  for (const sx of [-4, 3]) {
    ctx.beginPath(); ctx.ellipse(sx, 0, 2.5, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
  }
  // Tail
  ctx.save(); ctx.translate(-12, 0); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-9,-9); ctx.lineTo(-9,9); ctx.closePath();
  ctx.fillStyle = "#f97316"; ctx.fill(); ctx.restore();
  // Eye
  ctx.beginPath(); ctx.arc(9,-2,2.5,0,Math.PI*2); ctx.fillStyle="#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(9.8,-2.5,1,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.fill();

  ctx.restore();
}

// ── Obstacles ─────────────────────────────────────────────────────────────────

function drawCrab(ctx: CanvasRenderingContext2D, cx: number) {
  const y = FLOOR_Y - 4;
  const col = "#e05533";
  const dark = "#b03a20";

  // legs
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  for (const [ox, oy] of [[-14,6],[-8,9],[8,9],[14,6]]) {
    ctx.beginPath(); ctx.moveTo(cx+ox*0.5, y-4); ctx.lineTo(cx+ox, y+oy); ctx.stroke();
  }

  // body
  ctx.beginPath(); ctx.ellipse(cx, y-10, 20, 12, 0, 0, Math.PI*2);
  ctx.fillStyle = col; ctx.fill();
  // belly
  ctx.beginPath(); ctx.ellipse(cx, y-8, 13, 7, 0, 0, Math.PI*2);
  ctx.fillStyle = `rgba(240,120,80,0.5)`; ctx.fill();

  // left claw
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.moveTo(cx-20,y-10); ctx.lineTo(cx-32,y-18); ctx.lineTo(cx-28,y-4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-20,y-10); ctx.lineTo(cx-30,y-6); ctx.lineTo(cx-26,y+2); ctx.closePath(); ctx.fill();
  // right claw
  ctx.beginPath(); ctx.moveTo(cx+20,y-10); ctx.lineTo(cx+32,y-18); ctx.lineTo(cx+28,y-4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+20,y-10); ctx.lineTo(cx+30,y-6); ctx.lineTo(cx+26,y+2); ctx.closePath(); ctx.fill();

  // eyes on stalks
  for (const ex of [-8, 8]) {
    ctx.beginPath(); ctx.moveTo(cx+ex, y-22); ctx.lineTo(cx+ex, y-28);
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+ex, y-29, 4, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(cx+ex+1, y-30, 2, 0, Math.PI*2);
    ctx.fillStyle = "#111"; ctx.fill();
  }
}

function drawUrchin(ctx: CanvasRenderingContext2D, cx: number) {
  const cy = FLOOR_Y - 18;
  const r  = 14;
  const col = "#7c3f8a";

  // spines
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    // only draw spines above floor
    if (Math.sin(a) > 0.3) continue;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
    ctx.lineTo(cx + Math.cos(a)*(r+10), cy + Math.sin(a)*(r+10));
    ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + Math.cos(a)*(r+11), cy + Math.sin(a)*(r+11), 2, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();
  }

  // body
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(cx-3, cy-4, r*0.45, 0, Math.PI*2);
  ctx.fillStyle = "rgba(180,100,200,0.35)"; ctx.fill();

  // mouth dot
  ctx.beginPath(); ctx.arc(cx, cy+3, 3, 0, Math.PI*2);
  ctx.fillStyle = "#3a1a44"; ctx.fill();
}

function drawStarfish(ctx: CanvasRenderingContext2D, cx: number) {
  const cy = FLOOR_Y - 8;
  const col = "#e8884a";

  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 20 : 9;
    if (i === 0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
    else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
  }
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  // texture dots
  ctx.fillStyle = "rgba(255,180,100,0.5)";
  for (const [dx,dy] of [[0,-5],[6,3],[-6,3],[4,-8],[-4,-8]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawHermit(ctx: CanvasRenderingContext2D, cx: number) {
  const y = FLOOR_Y;
  const col = "#5a9a6e";
  const shellCol = "#c47a3a";

  // legs
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  for (const [ox, oy] of [[-10,5],[-5,8],[5,8],[10,5]]) {
    ctx.beginPath(); ctx.moveTo(cx+ox*0.4, y-8); ctx.lineTo(cx+ox, y+oy); ctx.stroke();
  }

  // shell (dome)
  ctx.beginPath(); ctx.ellipse(cx+4, y-18, 18, 22, -0.3, Math.PI, 0);
  ctx.fillStyle = shellCol; ctx.fill();
  // shell spiral lines
  ctx.strokeStyle = "rgba(160,90,20,0.6)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx+8, y-20, 8, 0.2, Math.PI*1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx+8, y-20, 4, 0.5, Math.PI*1.3); ctx.stroke();

  // head/claw poking out
  ctx.beginPath(); ctx.ellipse(cx-10, y-10, 8, 6, 0, 0, Math.PI*2);
  ctx.fillStyle = col; ctx.fill();
  // claw
  ctx.beginPath(); ctx.moveTo(cx-16,y-12); ctx.lineTo(cx-22,y-18); ctx.lineTo(cx-18,y-8); ctx.closePath();
  ctx.fillStyle = "#3a7050"; ctx.fill();
  // eye
  ctx.beginPath(); ctx.arc(cx-13, y-13, 2.5, 0, Math.PI*2);
  ctx.fillStyle = "#111"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx-12, y-14, 1, 0, Math.PI*2);
  ctx.fillStyle = "#fff"; ctx.fill();
}

// Obstacle config: hw = collision half-width, ch = collision height above floor
const OBS_CONFIG: Record<ObsType, {
  hw: number; ch: number;
  draw: (ctx: CanvasRenderingContext2D, cx: number) => void;
}> = {
  0: { hw: 22, ch: 22, draw: drawCrab     },
  1: { hw: 13, ch: 38, draw: drawUrchin   },
  2: { hw: 20, ch: 13, draw: drawStarfish },
  3: { hw: 17, ch: 28, draw: drawHermit   },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function SeaFloorHop() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<GameState>("idle");
  const fishY      = useRef(FLOOR_Y - FISH_R);
  const fishVY     = useRef(0);
  const obstacles  = useRef<Obstacle[]>([]);
  const speed      = useRef(INIT_SPEED);
  const score      = useRef(0);
  const frames     = useRef(0);
  const rafRef     = useRef(0);
  const W          = useRef(400);
  const nextObsAt  = useRef(220);

  const reset = useCallback(() => {
    fishY.current     = FLOOR_Y - FISH_R;
    fishVY.current    = 0;
    obstacles.current = [];
    speed.current     = INIT_SPEED;
    score.current     = 0;
    frames.current    = 0;
    nextObsAt.current = 220;
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current === "idle") {
      reset();
      stateRef.current = "playing";
      fishVY.current = JUMP_V;
    } else if (stateRef.current === "playing") {
      // Only jump when on or near the floor — prevents double jump
      if (fishY.current >= FLOOR_Y - FISH_R - 1) fishVY.current = JUMP_V;
    } else if (stateRef.current === "dead") {
      reset();
      stateRef.current = "playing";
      fishVY.current = JUMP_V;
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

    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); jump(); };
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });

    const ctx = canvas.getContext("2d")!;

    const tick = () => {
      const cw = W.current;
      const t  = performance.now() * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, GAME_BG_TOP);
      bg.addColorStop(1, GAME_BG_BOTTOM);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, H);

      // Distant bubbles
      ctx.fillStyle = GAME_BUBBLE_DIM;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc((i*173 + t*15) % cw, H - ((t*(8+i*2)) % (H+10)), 1.5 + (i%3)*0.5, 0, Math.PI*2);
        ctx.fill();
      }

      // Sandy floor
      ctx.fillStyle = "rgba(180,150,90,0.18)";
      ctx.fillRect(0, FLOOR_Y + 4, cw, H - FLOOR_Y - 4);
      // Floor line
      ctx.strokeStyle = "rgba(180,150,90,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, FLOOR_Y+4); ctx.lineTo(cw, FLOOR_Y+4); ctx.stroke();
      // Pebbles
      ctx.fillStyle = "rgba(120,100,60,0.25)";
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.ellipse((i*97+31) % cw, FLOOR_Y+10+(i%3)*4, 4+i%5, 2, 0, 0, Math.PI*2);
        ctx.fill();
      }

      if (stateRef.current === "playing") {
        frames.current++;
        speed.current += SPEED_INC;
        if (frames.current % SCORE_INTERVAL === 0) score.current++;

        // Physics
        fishVY.current += GRAVITY;
        fishY.current  += fishVY.current;

        // Floor — bounce gently, no death
        if (fishY.current >= FLOOR_Y - FISH_R) {
          fishY.current  = FLOOR_Y - FISH_R;
          fishVY.current = 0;
        }
        // Ceiling — cap, no death
        if (fishY.current <= FISH_R) {
          fishY.current  = FISH_R;
          fishVY.current = Math.max(0, fishVY.current);
        }

        // Spawn obstacles
        if (obstacles.current.length === 0 || cw - obstacles.current[obstacles.current.length-1].x > nextObsAt.current) {
          const type = Math.floor(Math.random() * 4) as ObsType;
          obstacles.current.push({ x: cw + 30, type });
          nextObsAt.current = 200 + Math.random() * 200;
        }

        // Move & cull
        obstacles.current = obstacles.current.filter(o => o.x > -60);
        for (const obs of obstacles.current) {
          obs.x -= speed.current;

          // Collision
          const { hw, ch } = OBS_CONFIG[obs.type];
          const nearX = Math.abs(FISH_X - obs.x) < FISH_R + hw - 4;
          const nearY = fishY.current + FISH_R > FLOOR_Y - ch;
          if (nearX && nearY) stateRef.current = "dead";
        }
      }

      // Draw obstacles
      for (const obs of obstacles.current) OBS_CONFIG[obs.type].draw(ctx, obs.x);

      // Draw fish
      drawFish(ctx, FISH_X, fishY.current, fishVY.current, t, stateRef.current === "dead" ? 0.35 : 1);

      // HUD
      ctx.font = "bold 12px monospace"; ctx.textAlign = "right";
      if (stateRef.current === "playing") {
        ctx.fillStyle = GAME_HUD_CYAN;
        ctx.fillText(`${score.current}`, cw - 12, 18);
      }

      if (stateRef.current === "idle") {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = "14px monospace";
        ctx.fillText("Tap to jump", cw/2, H/2 - 8);
        ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.font = "11px monospace";
        ctx.fillText("hop over the sea creatures", cw/2, H/2 + 14);
      }

      if (stateRef.current === "dead") {
        ctx.textAlign = "center";
        ctx.fillStyle = GAME_OVERLAY;
        ctx.fillRect(cw/2 - 130, H/2 - 28, 260, 58);
        ctx.fillStyle = GAME_DEATH_TEXT; ctx.font = "bold 13px monospace";
        ctx.fillText(`Squished!  Score: ${score.current}`, cw/2, H/2 - 4);
        ctx.fillStyle = GAME_DEATH_SUBTEXT; ctx.font = "11px monospace";
        ctx.fillText("Tap to try again", cw/2, H/2 + 18);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("touchstart", onTouchStart);
      ro.disconnect();
    };
  }, [jump]);

  return (
    <div
      className="w-full select-none"
      onClick={jump}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: H, display: "block", touchAction: "none" }}
      />
    </div>
  );
}
