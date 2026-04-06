# billykaufman.dev — Portfolio v2

Personal portfolio site rebuilt from scratch. v1 was Create React App + React Router v5 + plain CSS. This version is a full rewrite on a modern stack.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | react-icons |
| Package manager | pnpm |

## Pages

- **`/`** — Hero with 3D mouse-tracking parallax on the name, shimmer gradient text, rotating title
- **`/about`** — Bio, headshot, skills, tools, and client list
- **`/experience`** — Custom vertical timeline with per-entry accent colors
- **`/projects`** — Image carousel gallery with filter dropdown

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/               # Next.js App Router pages
  components/        # Shared UI components
  data/              # Static content (TypeScript)
public/
  images/            # Project screenshots, logos, background
```

## Deploy

Optimized for AWS Amplify or Vercel. All pages are statically generated at build time.

```bash
pnpm build
```
