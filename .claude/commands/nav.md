You are working on the `NavBar` component at `src/components/NavBar.tsx`. Here is the critical context you need before making any changes.

## Structure

The navbar renders two things inside a fragment:
1. `<motion.nav>` — fixed top bar, always visible, fades in on mount after HUD is ready
2. A fullscreen mobile menu overlay (`AnimatePresence` controlled by `mobileOpen`)

It only renders once `useHudVisible()` returns true (waits for the ocean HUD to appear so the nav doesn't flash before the scene is ready).

## Zone color system

The `--zone-accent` CSS variable drives all nav accent colors (underlines, index numbers, active pip, scan lines). It is set by `ZoneColorSync` elsewhere in the app based on scroll depth. The nav reads the same depth scale to display a zone label:

```ts
const DEPTH_STOPS = [0, 0.18, 0.38, 0.57, 0.74, 1];
const DEPTH_VALS  = [0,   50,  200,  500, 1000, 3800]; // meters
// zoneName: SUNLIGHT → TWILIGHT → MIDNIGHT → ABYSSAL → HADAL
```

The zone name appears in the desktop nav (right of links, `lg:` breakpoint only) and in the mobile menu footer.

## Desktop nav

- BK badge: `BkBadge` component (SVG with scan-line boot animation, corner brackets spring in/out on hover). Desktop only — mobile gets `StaticBkBadge` with tap-triggered brackets.
- Nav links: `NavLinkItem` — vertical text slide on hover, shared `layoutId="nav-underline"` animates the active underline between items.
- Section spy via `IntersectionObserver` with `-40% 0px -55% 0px` root margin.

## Mobile menu

Full-screen takeover, clip-path wipe animation (`inset(0 0 100% 0)` → `inset(0 0 0% 0)`). Large typographic nav list (text-5xl) with staggered entry.

**Scroll behavior on short viewports:** Links live in `overflow-y-auto` + `min-h-0` scroll container with an inner `min-h-full justify-center` div. This centers content when it fits and scrolls without clipping when the viewport is short. Do not collapse this back to a single `justify-center` div.

**Selection flow:** `handleMobileNavClick` runs two timers:
- 320ms → close menu (icon reverts to hamburger simultaneously)
- 700ms → scroll to section + clear `selectedHref`

The gap lets the scan-line sweep play before the curtain closes, and lets the curtain mostly close before the page scrolls.

## Hamburger icon — `MenuIcon`

Custom animated 3-line → X component. Three `motion.span` lines, staggered widths at rest (22/15/11px). On open: lines grow to equalize width, converge to center, middle fades, outer two rotate ±45°. On close: reverse. **Do not replace with an icon library icon** — the animation timing is carefully tuned.

## Scroll lock

`useScrollLock(mobileOpen)` from `src/hooks/useScrollLock.ts` handles body scroll lock when the mobile menu is open. The `Modal` component handles its own scroll lock independently. They do not conflict.

## Key hooks used

- `useScrollLock` — `src/hooks/useScrollLock.ts`
- `useHudVisible` — `src/hooks/useHudVisible.ts`
- `useMotionValueEvent`, `useScroll`, `useTransform` from framer-motion for live depth

$ARGUMENTS
