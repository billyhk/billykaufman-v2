You are working on the `ProjectsGallery` component at `src/components/ProjectsGallery.tsx`. Here is the critical context you need before making any changes.

## What it does

A scroll-driven project showcase. The section is `N * 80vh` tall — the user scrolls through it while a sticky panel stays fixed. Each "screen-height worth" of scroll corresponds to one project.

## Key constants

```ts
const N = projectsData.length;        // total project count
const NAV_H = 64;                      // navbar height in px
const ITEM_H = 40;                     // px height of each compact (non-active) list row
```

## Scroll math

`scrollYProgress` from framer-motion maps `[0, 1]` across the full section height.

Active project index: `Math.floor(v * (N - 0.0001))` — the small epsilon prevents the index from ever reaching `N` exactly at `v=1`.

`scrollToProject(idx)` targets `idx + 0.4` within its band (not the exact boundary `idx/N`, which can land one project early due to float rounding):
```ts
const target = top + ((idx + 0.4) / N) * Math.max(h - window.innerHeight, 0);
```

## Resize handling

`isResizing` ref freezes the `useMotionValueEvent` listener during resize so `activeIdx` doesn't flicker. `activeIdxRef` (a ref mirroring `activeIdx`) lets the resize effect read the current project without a stale closure. Both refs are declared before `useMotionValueEvent`.

After 200ms of no resize events, the handler restores scroll position with `behavior: "instant"`.

## MotionValue subscription rule

**Always pass `tiltTransform` to `style.transform` from the first render.** Conditionally passing a MotionValue breaks framer-motion's subscription. On mobile, zero out `tiltX`/`tiltY` instead of removing the prop.

## Right panel — sector32 list pattern

The list scrolls so the active item is always at top: `animate={{ y: -activeIdx * ITEM_H }}`. This works because all items before the active one are always exactly `ITEM_H` tall (compact rows). The active item expands in-place with full info — counter, title, client, tech pills, "Read more" button.

Non-active compact rows are `<button>` elements (not `div`) for accessibility, with `aria-label`.

## Data

Projects live in `src/data/projects.ts`. The `Project` type:
```ts
type Project = {
  key: string;
  title: string;
  client: string;
  technologies: string[];
  description: string;
  images: string[];       // empty array = no screenshots (use placeholder)
  banners?: BannerSize[]; // Bloomberg-style iframe showcase instead of image
  sourceCode?: string;
  deployment?: string;
};
```

## Description modal

"Read more" opens a `Modal` (see `src/components/Modal.tsx`) with full description + all tech pills. Modal is dismissed on Escape, backdrop click, or the ✕ button. Body scroll is locked while open (handled in Modal itself). `activeIdx` change auto-closes the modal.

## Mobile scroll hint

`sectionDone` (true when `scrollYProgress >= 0.999`) controls a fixed bottom "SCROLL" hint visible only on mobile (`md:hidden`). Stays visible through the last project — only hides after the user scrolls past the entire section.

$ARGUMENTS
