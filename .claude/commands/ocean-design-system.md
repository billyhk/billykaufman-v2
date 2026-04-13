You are working on the billykaufman-v2 portfolio. Before touching any UI, read this context on the design system.

## Core concept — "painted on top of a scene"

This is NOT a document-layout site. The UI is a HUD/console overlay rendered on top of a Three.js ocean scene. Think instrument panels and submarine consoles, not cards and grids.

Rules that follow from this:
- No box shadows that suggest floating material cards
- No rounded-lg / rounded-xl generic radii — use `clip-tr`, `clip-bl`, `clip-tr-bl` (irregular console corners defined in globals.css)
- No white backgrounds or light themes
- Spacing and layout should feel structural, not decorative

## The zone color system

`--zone-accent` is a CSS variable set on `:root` by `ZoneColorSync` based on scroll depth. It changes as the user dives through ocean zones:

| Zone | Color |
|------|-------|
| Sunlight (0–50m) | `#67e8f9` cyan |
| Twilight (50–200m) | blue |
| Midnight (200–500m) | deeper blue |
| Abyssal (500–1000m) | indigo/violet |
| Hadal (1000m+) | deep violet |

**Always use `var(--zone-accent)` for interactive accents, underlines, active states, and HUD elements.** Never hardcode a blue/cyan color for accent purposes — the zone system will look wrong at depth.

## Typography

- Font: Raleway (primary), Inter (fallback), system-ui
- HUD labels / counters: `font-mono`, small, `tracking-widest`, low opacity (0.3–0.6)
- Body copy: Raleway, `text-white/70`
- Never use serif fonts

## globals.css — key classes

```css
/* Irregular console corners */
.clip-tr     { border-radius: 4px 20px 8px 6px; }   /* top-right prominent */
.clip-tr-lg  { border-radius: 6px 32px 12px 8px; }
.clip-bl     { border-radius: 8px 6px 4px 20px; }   /* bottom-left prominent */
.clip-bl-lg  { border-radius: 10px 8px 6px 32px; }
.clip-tr-bl  { border-radius: 4px 20px 8px 20px; }  /* both prominent */

/* Scrollbars — native scrollbar is globally hidden */
/* Add .styled-scrollbar to elements that need a visible thin scrollbar */
.styled-scrollbar { ... } /* uses --zone-accent at 30% opacity */

/* Animated gradients */
.btn-cta      { animated multi-stop gradient button }
.name-shimmer { shimmer text effect for hero name }
.marquee-track { infinite horizontal scroll }
```

**Important:** `::-webkit-scrollbar { width: 0 }` hides ALL scrollbars globally. If an element needs a scrollbar, give it `className="styled-scrollbar"` — the class selector overrides the element selector.

## Three.js / ocean scene

- Entry: `src/components/ocean/` — do not modify unless explicitly working on the 3D scene
- `HeroElements.tsx` — ambient orbs + cursor fish (desktop only, hidden on touch devices)
- The cursor fish replaces the OS cursor (`cursor: none` on body) — every modal/overlay must restore it with `style={{ cursor: "default" }}`. The `Modal` component already does this.
- Canvas background: `#000408` — set on both `html` and `body` to prevent iOS safe-area gaps

## iOS / mobile constraints (do NOT undo these)

- `html { touch-action: pan-y; overscroll-behavior-x: none; }` — prevents horizontal swipe-back interference
- `overflow-x: hidden` is on `body`, NOT `html` — Safari treats it on html as hiding both axes which kills touch scrolling
- `scroll-behavior: smooth` is removed from CSS — iOS intercepts it on first touch. Use `scrollIntoView({ behavior: 'smooth' })` in JS instead
- Native scrollbar hidden globally via `::-webkit-scrollbar { width: 0 }` — replaced by HUD DepthGauge

## HUD screen component pattern

The `HudScreen` in `ProjectsGallery` is the canonical example of a "console screen":
- Irregular border radius (`clip-tr`)
- `border: 1px solid color-mix(in srgb, var(--zone-accent) 38%, transparent)`
- Box shadow stack: accent glow + inner depth shadow + elevation shadows
- Scanline overlay (`repeating-linear-gradient`) + radial vignette
- Status bar at bottom: `font-mono`, tiny, dark background tinted with zone accent
- `ScreenBrackets` SVG corner decorations

## Constants and data

- `src/constants/urls.ts` — all external URLs (never hardcode URLs inline)
- `src/data/projects.ts` — project entries
- `src/data/experience.ts` — work history
- `src/data/clients.ts` — client logos for marquee
- `src/data/social.ts` — social links

$ARGUMENTS
