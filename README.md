# billyhkaufman.com — Portfolio v2

Personal portfolio rebuilt from scratch with an ocean/depth theme. Scroll deeper through the page to go further underwater — from the sunlit surface (~50m) down to the abyss (~3800m).

Live at **[billyhkaufman.com](https://billyhkaufman.com)**

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion, GSAP |
| 3D | Three.js + React Three Fiber |
| Icons | react-icons |
| Deploy | AWS Amplify |
| Package manager | pnpm |

## Features

- **Particle name** — "Billy Kaufman" rendered as canvas particles with spring physics; cursor repels particles on hover
- **3D fish cursor** — animated clownfish GLTF model that tracks the mouse across the hero
- **Ocean depth progression** — sections labeled by depth (~50m → ~3800m) with ambient particle background
- **Projects filmstrip** — featured + sidebar filmstrip layout; click to switch projects; filmstrip auto-scrolls to active thumbnail
- **Client cards** — magnetic 3D tilt + per-client accent glow follows the cursor; tap for details modal
- **Skills grid** — per-category accent colors with scroll-triggered stagger animations
- **Experience timeline** — scroll-triggered slide-in animations per entry
- **Canvas mini-games** — desktop: eat-or-be-eaten fish game with 7 NPC species; mobile: tap-to-jump sea floor runner
- **OG image** — auto-generated social preview via Next.js ImageResponse
- **Scroll progress bar** — gradient line fills as you scroll

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Project Structure

```
src/
  app/               # Next.js App Router (layout, page, OG image)
  components/        # UI components + canvas games (one file per section)
  components/ocean/  # Depth theme components (DepthSection, DepthLabel)
  constants/         # Shared design tokens (colors.ts)
  data/              # Static content as TypeScript (bio, experience, projects, skills)
public/
  images/            # Headshot, project screenshots, logos
  bloomberg/         # HTML5 banner ad files
```

## Content Updates

All copy lives in `src/data/`. Edit without touching components:

- `bio.ts` — name, title, paragraphs, highlights chips, `IS_OPEN_TO_WORK` flag
- `experience.ts` — timeline entries
- `projects.ts` — project cards + images
- `skills.ts` / `tools.ts` — skills grid
- `clients.ts` — client cards (logo, description, accent color)
- `social.ts` — social links (used in hero + contact footer)

## Deploy

Hosted on AWS Amplify with SSR. Builds automatically on push to `main`.

```bash
pnpm build
```
