"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const H                = 420;
const PLAYER_INIT_SIZE = 16;
const NPC_COUNT        = 22;
const PLAYER_LERP      = 0.07;
const NPC_BASE_SPEED   = 0.7;
const CHASE_RADIUS     = 160;
const EAT_RATIO        = 1.08;
const GROW_FACTOR      = 1.045;
const EDGE_PAD         = 60;
const SPAWN_INTERVAL_MS = 1200;
const MAX_NPC_CAP       = 80;

// species: 0=oval  1=torpedo  2=angler  3=puffer  4=tall  5=eel  6=lantern
type Species = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const SPECIES_POOL: Species[] = [0,0,0,0, 1,1,1, 2,2, 3,3, 4,4,4, 5,5, 6];

type GameState = "idle" | "playing" | "dead";

type NPC = {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  wobble: number;
  species: Species;
};

let nextId = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────
function spawnNPC(W: number, playerSize: number, fromEdge = true, forceSmaller = false): NPC {
  const smaller = forceSmaller || Math.random() < 0.68;
  const size = smaller
    ? Math.max(6, playerSize * (0.2 + Math.random() * 0.7))
    : playerSize * (1.1 + Math.random() * 1.2);

  const speed = NPC_BASE_SPEED * (10 / Math.max(size, 10)) * 0.6 + NPC_BASE_SPEED * 0.4;
  const angle = Math.random() * Math.PI * 2;

  let x: number, y: number;
  if (fromEdge) {
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0)      { x = -size;    y = Math.random() * H; }
    else if (edge === 1) { x = W + size; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = -size; }
    else                 { x = Math.random() * W; y = H + size; }
  } else {
    x = Math.random() * W;
    y = Math.random() * H;
  }

  const species = SPECIES_POOL[Math.floor(Math.random() * SPECIES_POOL.length)];
  return { id: nextId++, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, wobble: Math.random() * Math.PI * 2, species };
}

// ── Species drawing ───────────────────────────────────────────────────────────

// 0 — Generic oval fish (original)
function drawOval(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number, tailWag: number) {
  const col  = `rgb(${r},${g},${b})`;
  const lite = `rgba(${Math.min(r+60,255)},${Math.min(g+60,255)},${Math.min(b+60,255)},0.4)`;

  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.ellipse(2, 2, s * 0.6, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = lite; ctx.fill();

  ctx.save(); ctx.translate(-s, 0); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*0.7,-s*0.6); ctx.lineTo(-s*0.7,s*0.6); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();

  const es = Math.max(1.5, s * 0.15);
  ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.15, es, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();
}

// 1 — Torpedo / tuna — sleek, forked tail, dorsal spike
function drawTorpedo(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number, tailWag: number) {
  const col  = `rgb(${r},${g},${b})`;
  const dark = `rgba(${Math.max(r-40,0)},${Math.max(g-40,0)},${Math.max(b-40,0)},0.9)`;

  // elongated body
  ctx.beginPath(); ctx.ellipse(0, 0, s * 1.4, s * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();
  // belly stripe
  ctx.beginPath(); ctx.ellipse(s * 0.1, s * 0.1, s * 0.9, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,0.18)`; ctx.fill();

  // dorsal fin
  ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.38); ctx.lineTo(s * 0.6, -s * 0.8); ctx.lineTo(-s * 0.2, -s * 0.38); ctx.closePath();
  ctx.fillStyle = dark; ctx.fill();

  // forked tail
  ctx.save(); ctx.translate(-s * 1.35, 0); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*0.7,-s*0.55); ctx.lineTo(-s*0.3,0); ctx.lineTo(-s*0.7,s*0.55); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();

  const es = Math.max(1.2, s * 0.12);
  ctx.beginPath(); ctx.arc(s * 1.1, -s * 0.08, es, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 1.14, -s * 0.11, es * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
}

// 2 — Anglerfish — round body, gaping jaw, glowing lure
function drawAngler(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number, tailWag: number, t: number) {
  const col  = `rgb(${Math.max(r-30,0)},${Math.max(g-30,0)},${Math.max(b-30,0)})`;

  // body — wide and rounded
  ctx.beginPath(); ctx.ellipse(0, -s*0.1, s * 0.95, s * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();

  // lower jaw juts forward
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.25);
  ctx.lineTo(s * 0.9, s * 0.55);
  ctx.lineTo(-s * 0.2, s * 0.55);
  ctx.lineTo(-s * 0.1, s * 0.2);
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();

  // teeth (top)
  for (let i = 0; i < 4; i++) {
    const tx = s * 0.5 - i * s * 0.25;
    ctx.beginPath(); ctx.moveTo(tx, s * 0.25); ctx.lineTo(tx + s * 0.07, s * 0.5); ctx.lineTo(tx - s * 0.07, s * 0.5); ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
  }

  // lure rod from forehead
  const lureSwing = Math.sin(t * 2.5 + 1) * s * 0.3;
  ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.75); ctx.lineTo(s * 0.55 + lureSwing, -s * 1.35);
  ctx.strokeStyle = `rgba(${r},${g},${b},0.7)`; ctx.lineWidth = Math.max(1, s * 0.06); ctx.stroke();
  // lure glow
  ctx.shadowBlur = 10; ctx.shadowColor = `rgb(${r},${g},${b})`;
  ctx.beginPath(); ctx.arc(s * 0.55 + lureSwing, -s * 1.38, s * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${Math.min(r+80,255)},${Math.min(g+80,255)},${Math.min(b+80,255)},0.95)`; ctx.fill();
  ctx.shadowBlur = 0;

  // tail
  ctx.save(); ctx.translate(-s * 0.9, -s * 0.1); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*0.6,-s*0.5); ctx.lineTo(-s*0.6,s*0.5); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();

  // big eye
  const es = Math.max(2, s * 0.2);
  ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.25, es, 0, Math.PI * 2);
  ctx.fillStyle = "#eee"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.52, -s * 0.27, es * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.57, -s * 0.31, es * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
}

// 3 — Pufferfish — round, spines, spots
function drawPuffer(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number) {
  const col  = `rgb(${r},${g},${b})`;
  const spot = `rgba(${Math.max(r-50,0)},${Math.max(g-50,0)},${Math.max(b-50,0)},0.5)`;

  // round body
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();

  // spines radiating outward
  const spineAngles = [-2.0,-1.3,-0.6, 0, 0.6, 1.3, 2.0, 2.7, -2.7, Math.PI];
  for (const a of spineAngles) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9);
    ctx.lineTo(Math.cos(a) * (s * 1.3 + s * 0.1), Math.sin(a) * (s * 1.3 + s * 0.1));
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, s * 0.08); ctx.stroke();
    // spine tip
    ctx.beginPath(); ctx.arc(Math.cos(a) * s * 1.3, Math.sin(a) * s * 1.3, Math.max(0.8, s * 0.05), 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
  }

  // belly spots
  for (let i = 0; i < 5; i++) {
    const sx = (i - 2) * s * 0.32;
    ctx.beginPath(); ctx.arc(sx, s * 0.3, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = spot; ctx.fill();
  }

  // tiny tail
  ctx.beginPath(); ctx.moveTo(-s*0.9,0); ctx.lineTo(-s*1.3,-s*0.35); ctx.lineTo(-s*1.3,s*0.35); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();

  // tiny mouth
  ctx.beginPath(); ctx.arc(s * 0.85, s * 0.05, s * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${Math.max(r-60,0)},${Math.max(g-60,0)},${Math.max(b-60,0)},0.9)`; ctx.fill();

  const es = Math.max(1.5, s * 0.18);
  ctx.beginPath(); ctx.arc(s * 0.6, -s * 0.35, es, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.65, -s * 0.38, es * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
}

// 4 — Tall body fish (butterflyfish / surgeonfish) — tall oval, eye stripe
function drawTall(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number, tailWag: number) {
  const col  = `rgb(${r},${g},${b})`;
  const dark = `rgba(${Math.max(r-60,0)},${Math.max(g-60,0)},${Math.max(b-60,0)},0.85)`;

  // tall oval body
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.7, s * 1.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();

  // vertical eye stripe
  ctx.beginPath(); ctx.ellipse(s * 0.35, 0, s * 0.15, s * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = dark; ctx.fill();

  // dorsal fin (triangle on top)
  ctx.beginPath(); ctx.moveTo(-s*0.4, -s*1.1); ctx.lineTo(s*0.3, -s*1.1); ctx.lineTo(s*0.1, -s*1.55); ctx.closePath();
  ctx.fillStyle = dark; ctx.fill();

  // ventral fin
  ctx.beginPath(); ctx.moveTo(-s*0.2, s*1.1); ctx.lineTo(s*0.3, s*1.1); ctx.lineTo(s*0.05, s*1.5); ctx.closePath();
  ctx.fillStyle = dark; ctx.fill();

  // small pointed tail
  ctx.save(); ctx.translate(-s*0.7, 0); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*0.55,-s*0.4); ctx.lineTo(-s*0.55,s*0.4); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();

  const es = Math.max(1.5, s * 0.15);
  ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.25, es, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.28, es * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
}

// 5 — Eel — long sinuous ribbon body
function drawEel(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number, t: number, wobble: number) {
  const col = `rgb(${r},${g},${b})`;
  const len = s * 3.5;
  const w   = Math.max(2, s * 0.28);
  const wave1 = Math.sin(t * 4 + wobble) * s * 0.45;
  const wave2 = Math.sin(t * 4 + wobble + 1.2) * s * 0.3;

  // ribbon body via filled bezier stroke
  ctx.beginPath();
  ctx.moveTo(s * 0.6, -w);
  ctx.bezierCurveTo(0, wave1 - w, -len * 0.55, wave2 - w, -len, -w * 0.4);
  ctx.lineTo(-len, w * 0.4);
  ctx.bezierCurveTo(-len * 0.55, wave2 + w, 0, wave1 + w, s * 0.6, w);
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();

  // head
  ctx.beginPath(); ctx.ellipse(s * 0.55, 0, s * 0.45, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();

  // tail tip
  ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(-len - s * 0.5, -s * 0.25); ctx.lineTo(-len - s * 0.5, s * 0.25); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();

  const es = Math.max(1.2, s * 0.12);
  ctx.beginPath(); ctx.arc(s * 0.8, -s * 0.08, es, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();
}

// 6 — Lanternfish — small round, huge eyes, glowing belly dots
function drawLantern(ctx: CanvasRenderingContext2D, s: number, r: number, g: number, b: number, tailWag: number, t: number) {
  const col = `rgb(${Math.max(r-20,0)},${Math.max(g-20,0)},${Math.max(b-20,0)})`;

  // body
  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();

  // tail
  ctx.save(); ctx.translate(-s, 0); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*0.65,-s*0.5); ctx.lineTo(-s*0.65,s*0.5); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();

  // glowing belly photophores
  const glowPulse = 0.7 + Math.sin(t * 3 + 1) * 0.3;
  ctx.shadowBlur = 8 * glowPulse;
  ctx.shadowColor = `rgb(${Math.min(r+100,255)},${Math.min(g+100,255)},${Math.min(b+100,255)})`;
  for (let i = 0; i < 4; i++) {
    const dx = (i - 1.5) * s * 0.42;
    ctx.beginPath(); ctx.arc(dx, s * 0.35, Math.max(1, s * 0.09), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(r+120,255)},${Math.min(g+120,255)},${Math.min(b+120,255)},${glowPulse})`;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // oversized eyes (deep sea adaptation)
  const es = Math.max(2, s * 0.28);
  ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.1, es, 0, Math.PI * 2);
  ctx.fillStyle = "#dde"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.57, -s * 0.12, es * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.62, -s * 0.17, es * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
}

// ── NPC dispatch ──────────────────────────────────────────────────────────────
function drawNPC(ctx: CanvasRenderingContext2D, npc: NPC, playerSize: number, t: number) {
  const ratio = npc.size / playerSize;
  let r: number, g: number, b: number;
  if (ratio < 0.85)             { r = 60;  g = 200; b = 160; }
  else if (ratio < 1 / EAT_RATIO) { r = 230; g = 200; b = 60;  }
  else                           { r = 220; g = 60;  b = 60;  }

  const tailWag = Math.sin(t * 7 + npc.wobble) * 0.3;

  ctx.save();
  ctx.translate(npc.x, npc.y);
  if (npc.vx < 0) ctx.scale(-1, 1);

  switch (npc.species) {
    case 0: drawOval(ctx, npc.size, r, g, b, tailWag); break;
    case 1: drawTorpedo(ctx, npc.size, r, g, b, tailWag); break;
    case 2: drawAngler(ctx, npc.size, r, g, b, tailWag, t); break;
    case 3: drawPuffer(ctx, npc.size, r, g, b); break;
    case 4: drawTall(ctx, npc.size, r, g, b, tailWag); break;
    case 5: drawEel(ctx, npc.size, r, g, b, t, npc.wobble); break;
    case 6: drawLantern(ctx, npc.size, r, g, b, tailWag, t); break;
  }

  ctx.restore();
}

// ── Player fish (clownfish) ───────────────────────────────────────────────────
function drawPlayerFish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, vx: number, vy: number, t: number) {
  const scale = size / PLAYER_INIT_SIZE;
  ctx.save();
  ctx.translate(x, y);
  if (vx < -0.1) ctx.scale(-1, 1);
  ctx.rotate(Math.max(-0.4, Math.min(0.4, vy * 0.2)));
  ctx.scale(scale, scale);

  // Body
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#f97316"; ctx.fill();

  // White stripes
  for (const sx of [-4, 3]) {
    ctx.beginPath(); ctx.ellipse(sx, 0, 2.5, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
  }

  // Animated tail
  const tailWag = Math.sin(t * 8) * 0.3;
  ctx.save(); ctx.translate(-12, 0); ctx.rotate(tailWag);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-9,-9); ctx.lineTo(-9,9); ctx.closePath();
  ctx.fillStyle = "#f97316"; ctx.fill(); ctx.restore();

  // Eye
  ctx.beginPath(); ctx.arc(9, -2, 2.5, 0, Math.PI * 2); ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(9.8, -2.5, 1, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FishEat() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const stateRef    = useRef<GameState>("idle");
  const playerX     = useRef(0);
  const playerY     = useRef(H / 2);
  const playerVX    = useRef(0);
  const playerVY    = useRef(0);
  const targetX     = useRef(0);
  const targetY     = useRef(H / 2);
  const playerSize  = useRef(PLAYER_INIT_SIZE);
  const npcs        = useRef<NPC[]>([]);
  const score       = useRef(0);
  const rafRef      = useRef(0);
  const W           = useRef(600);
  const lastSpawn   = useRef(0);

  const reset = useCallback(() => {
    const w = W.current;
    playerX.current    = w * 0.2;
    playerY.current    = H / 2;
    targetX.current    = w * 0.2;
    targetY.current    = H / 2;
    playerVX.current   = 0;
    playerVY.current   = 0;
    playerSize.current = PLAYER_INIT_SIZE;
    score.current      = 0;
    lastSpawn.current  = performance.now();
    npcs.current       = Array.from({ length: NPC_COUNT }, () => spawnNPC(w, PLAYER_INIT_SIZE, false));
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
      targetX.current = e.clientX - rect.left;
      targetY.current = e.clientY - rect.top;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX.current = e.clientX - rect.left;
      targetY.current = e.clientY - rect.top;
      if (stateRef.current === "idle" || stateRef.current === "dead") {
        reset();
        playerX.current = targetX.current;
        playerY.current = targetY.current;
        stateRef.current = "playing";
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);

    const ctx = canvas.getContext("2d")!;

    const tick = () => {
      const cw  = W.current;
      const t   = performance.now() * 0.001;
      const now = performance.now();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "rgb(2, 10, 30)");
      bg.addColorStop(1, "rgb(1, 4, 16)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, H);

      // Bubbles
      ctx.fillStyle = "rgba(103,232,249,0.06)";
      for (let i = 0; i < 8; i++) {
        const bx = ((i * 137 + t * 20) % cw);
        const by = H - ((t * (10 + i * 3)) % (H + 20));
        ctx.beginPath(); ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
      }

      if (stateRef.current === "playing") {
        // Player movement (lerp)
        const prevX      = playerX.current;
        const prevY      = playerY.current;
        playerX.current += (targetX.current - playerX.current) * PLAYER_LERP;
        playerY.current += (targetY.current - playerY.current) * PLAYER_LERP;
        playerVX.current = playerX.current - prevX;
        playerVY.current = playerY.current - prevY;

        // Clamp
        const ps = playerSize.current;
        playerX.current = Math.max(ps, Math.min(cw - ps, playerX.current));
        playerY.current = Math.max(ps, Math.min(H  - ps, playerY.current));

        // Continuous spawning — burst more when pool is sparse
        if (now - lastSpawn.current > SPAWN_INTERVAL_MS && npcs.current.length < MAX_NPC_CAP) {
          lastSpawn.current = now;
          const smallCount = npcs.current.filter(n => n.size < ps).length;
          const forceSmaller = smallCount < npcs.current.length * 0.5;
          const burst = npcs.current.length < NPC_COUNT ? 3 : 1;
          for (let i = 0; i < burst && npcs.current.length < MAX_NPC_CAP; i++) {
            npcs.current.push(spawnNPC(cw, ps, true, forceSmaller));
          }
        }

        // NPC AI
        for (const npc of npcs.current) {
          const ndx   = playerX.current - npc.x;
          const ndy   = playerY.current - npc.y;
          const ndist = Math.hypot(ndx, ndy);
          if (npc.size > ps * EAT_RATIO && ndist < CHASE_RADIUS) {
            const force = (1 - ndist / CHASE_RADIUS) * 0.09;
            npc.vx += (ndx / ndist) * force;
            npc.vy += (ndy / ndist) * force;
          }
          const spd    = Math.hypot(npc.vx, npc.vy);
          const maxSpd = NPC_BASE_SPEED * (12 / Math.max(npc.size, 8));
          if (spd > maxSpd) { npc.vx = (npc.vx / spd) * maxSpd; npc.vy = (npc.vy / spd) * maxSpd; }
          npc.x += npc.vx; npc.y += npc.vy;
          if (npc.x < -EDGE_PAD) npc.x = cw + EDGE_PAD;
          if (npc.x > cw + EDGE_PAD) npc.x = -EDGE_PAD;
          if (npc.y < -EDGE_PAD) npc.y = H + EDGE_PAD;
          if (npc.y > H + EDGE_PAD) npc.y = -EDGE_PAD;
        }

        // Collision
        npcs.current = npcs.current.filter(npc => {
          const cdist  = Math.hypot(playerX.current - npc.x, playerY.current - npc.y);
          const overlap = cdist < ps * 0.8 + npc.size * 0.8;
          if (!overlap) return true;
          if (ps > npc.size * EAT_RATIO) {
            score.current++;
            playerSize.current *= GROW_FACTOR;
            const smallCount = npcs.current.filter(n => n.size < ps).length;
            npcs.current.push(spawnNPC(cw, playerSize.current, true, smallCount < NPC_COUNT * 0.5));
            return false;
          } else if (npc.size > ps * EAT_RATIO) {
            stateRef.current = "dead";
          }
          return true;
        });
      }

      // Draw NPCs
      for (const npc of npcs.current) drawNPC(ctx, npc, playerSize.current, t);

      // Draw player
      if (stateRef.current !== "idle") {
        drawPlayerFish(ctx, playerX.current, playerY.current, playerSize.current, playerVX.current, playerVY.current, t);
      }

      // HUD
      ctx.font = "bold 13px monospace"; ctx.textAlign = "left";
      if (stateRef.current === "playing") {
        ctx.fillStyle = "rgba(103,232,249,0.7)";
        ctx.fillText(`${score.current} eaten`, 14, 22);
      }
      if (stateRef.current === "idle") {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = "14px monospace";
        ctx.fillText("Click to start swimming", cw / 2, H / 2 - 10);
        ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "12px monospace";
        ctx.fillText("Eat smaller fish  •  avoid bigger ones", cw / 2, H / 2 + 14);
      }
      if (stateRef.current === "dead") {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(cw / 2 - 160, H / 2 - 36, 320, 72);
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "bold 15px monospace";
        ctx.fillText(`You got eaten!  Score: ${score.current}`, cw / 2, H / 2 - 8);
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "12px monospace";
        ctx.fillText("Click to try again", cw / 2, H / 2 + 16);
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
    <div className="w-full select-none">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: H, display: "block", touchAction: "none" }}
        className="rounded-2xl border border-white/10"
      />
    </div>
  );
}
