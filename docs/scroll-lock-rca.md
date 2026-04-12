# Mobile Scroll Lock — Root Cause Analysis

**Symptom:** On mobile (iOS Chrome/Safari and Chrome DevTools mobile emulation), the page scroll intermittently fails. The first touch gesture springs back or locks to the horizontal axis. A slight horizontal swipe, or waiting a moment, "resets" it and vertical scrolling then works.

**Branch:** `demo/scroll-issue-rca` — reproduces the broken state with console instrumentation.

---

## How to Reproduce

1. Check out `demo/scroll-issue-rca`
2. Run `pnpm dev` and open on a mobile device or Chrome DevTools → Device Toolbar
3. Open the browser console
4. Try to scroll the page — notice the first gesture springs back or fails
5. Watch the console: every `touchstart` is logged with the intercepting element and its computed `touch-action`

To apply the fix mid-demo, uncomment the one line in `src/components/ocean/OceanCanvas.tsx`:

```tsx
// THE FIX — uncomment to restore correct scroll behavior:
style={{ pointerEvents: "none", touchAction: "pan-y" }}
```

---

## Element Hierarchy

The page has a full-viewport Three.js canvas (`OceanCanvas`) sitting behind all content:

```
<body>
  │
  ├── <motion.div class="fixed inset-0 pointer-events-none">   ← OceanCanvas wrapper
  │     │   CSS class: pointer-events: none
  │     │   style:     touch-action: pan-y
  │     │
  │     └── [R3F Canvas renders the following internally]
  │           │
  │           ├── <div style="pointer-events: auto; overflow: hidden">  ← R3F outer div ⚠
  │           │     │
  │           │     └── <div style="width:100%; height:100%">           ← R3F inner div
  │           │           │
  │           │           └── <canvas style="display:block">            ← WebGL canvas
  │
  └── <main class="relative z-10">
        └── [page content — hero, about, projects, etc.]
```

The R3F outer div is hardcoded to `pointer-events: auto` via **inline style**. This is set inside `@react-three/fiber`'s `CanvasImpl` source:

```js
// node_modules/@react-three/fiber/dist/react-three-fiber.cjs.dev.js
const pointerEvents = eventSource ? 'none' : 'auto';  // 'auto' when no eventSource is passed
return jsx("div", {
  style: {
    overflow: 'hidden',
    pointerEvents,  // ← 'auto'
    ...style        // ← our style prop (if provided) is spread here, after pointerEvents
  }
});
```

---

## Why `pointer-events: none` on the Wrapper Doesn't Help

A common assumption: if the wrapper div has `pointer-events: none`, all children inherit it.

**This is wrong for HTML elements.**

From MDN:
> *"When specified on non-SVG elements: `none` indicates that the element is never the target of pointer events. **However, pointer events may target its descendant elements** if those descendants have `pointer-events` set to some other value."*

The R3F outer div has `pointer-events: auto` as an **inline style**. Inline styles have higher specificity than CSS classes. So:

```
wrapper class:        pointer-events: none   ← loses (CSS class)
R3F div inline style: pointer-events: auto   ← wins  (inline style)
```

The R3F div receives all touch events — and since it is `fixed inset-0`, it is the touch target for the **entire viewport**.

---

## The `touch-action` Chain

`touch-action` tells the browser which scroll directions to allow for gestures that start on a given element. The browser resolves it by intersecting the element's own value with all ancestors up to (but not including) the nearest scroll container.

For the R3F outer div:

```
Ancestor chain (up to scroll container):
  R3F outer div:      touch-action: [not set] → inherits as 'auto'
  OceanCanvas wrapper:touch-action: pan-y      ← we set this
  <main>:             touch-action: [not set] → 'auto'
  <body>:             touch-action: pan-y      ← we set this

Used touch-action = intersection of all = ??
```

The catch: **`body` is not the scroll container for `position: fixed` elements**. Fixed elements are positioned relative to the viewport (the initial containing block). The scroll container chain for the R3F div goes directly to the viewport, bypassing `<body>`.

So `touch-action: pan-y` on `<body>` does **not** reach the R3F div. Its effective `touch-action` is `auto`.

```
Effective touch-action on R3F div: auto
                                    ↑
                     allows ANY scroll direction
```

With `auto`, the browser uses the first touch gesture to detect the intended scroll axis. If it detects any horizontal intent (or if horizontal overflow exists anywhere), it can lock to horizontal — and vertical scroll fails.

---

## The Fix

Pass `style` directly to the R3F `<Canvas>` component:

```tsx
// src/components/ocean/OceanCanvas.tsx

<Canvas
  camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 200 }}
  gl={{ antialias: true, alpha: false }}
  dpr={[1, 1.5]}
  style={{ pointerEvents: "none", touchAction: "pan-y" }}  // ← THE FIX
>
```

R3F spreads the `style` prop into its outer div's style object **after** its own computed values:

```js
style: {
  overflow: 'hidden',
  pointerEvents,       // R3F sets 'auto' here...
  ...style             // ...but our { pointerEvents: 'none' } overwrites it
}
```

This works because the last key wins in a JavaScript object spread.

**Result:**

```
R3F outer div inline style: pointer-events: none  ✓
                             touch-action: pan-y   ✓
```

Now the R3F div is no longer a touch target. Touches pass through it to the page content below (`<main>`), which is in the normal flow and correctly inherits `touch-action: pan-y` from `<body>`.

---

## Supporting Fixes

These were applied alongside the main fix. None alone would have solved it, but together they harden the behavior across edge cases.

### 1. `touch-action: pan-y` on `<html>`

```css
html {
  touch-action: pan-y;
  overscroll-behavior-x: none;
}
```

`body`-level `touch-action` doesn't reach fixed elements (as shown above). Setting it on `<html>` covers the document root scroll container, which is where fixed elements ultimately resolve their scroll behavior.

### 2. `overflow-x: clip` on `<main>` instead of `hidden`

```tsx
<main style={{ overflowX: "clip" }}>
```

`overflow-x: hidden` creates a **scroll container** — the browser can consider it horizontally scrollable (even though the overflow is visually hidden). `overflow-x: clip` clips the content without creating a scroll container, so the browser never treats `<main>` as a potential horizontal scroll target.

### 3. Remove `scroll-behavior: smooth` from `<html>`

```css
html {
  /* scroll-behavior: smooth; ← removed */
}
```

iOS Safari treats CSS `scroll-behavior: smooth` on the document root as an active animation. On fresh page load, this animation competes with the user's first touch gesture and causes spring-back. Smooth scrolling for navbar links is preserved via `scrollIntoView({ behavior: 'smooth' })` in JavaScript.

---

## Console Output: Broken vs Fixed

When you interact with the page on the demo branch, the console logs every `touchstart`:

**Broken (fix commented out):**
```
[ScrollDebug] touchstart
  target:          <div style="pointer-events: auto; overflow: hidden">
  pointer-events:  auto  ← receiving touch (this element owns the gesture)
  touch-action:    auto  ← any axis allowed (BUG)
  ⚠ touch-action:auto on the touch target — browser may lock to horizontal axis
```

**Fixed (style prop uncommented):**
```
[ScrollDebug] touchstart
  target:          <section id="home" ...>   (or whichever content element was touched)
  pointer-events:  auto
  touch-action:    pan-y  ← vertical only (FIXED)
  ✓ touch-action is restricted to pan-y — vertical scroll will work
```

---

## Key Takeaways

| Concept | Detail |
|---|---|
| CSS class vs inline style | Inline styles always win over class-based styles, including Tailwind utilities |
| `pointer-events: none` inheritance | Does **not** cascade to children in HTML (unlike SVG) |
| `touch-action` scope | Resolves up to the nearest scroll container — `body`'s value doesn't reach `fixed` elements |
| `overflow: hidden` vs `clip` | `hidden` creates a scroll container; `clip` does not |
| `scroll-behavior: smooth` on `<html>` | Causes iOS to treat fresh-load as an active animation, intercepting first touch |
