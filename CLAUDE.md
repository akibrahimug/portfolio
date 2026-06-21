# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a **single-app Next.js project** with a deprecated backend kept in-tree for history.

- `client/` — Next.js (Pages Router) frontend. **The deployed thing.** TypeScript, Tailwind v4, Framer Motion, next-themes, Resend (contact form).
- `server/` — Express + WebSocket + MongoDB backend. **Deprecated 2026-04-30** (see `server/README.md`). Not deployed, not referenced by the client build.
- `docs/` — `design-inspiration.md` (research) and `redesign.md` (architecture reference).

The repo went through a redesign + a static migration. Today the public site is fully static; the only server-side code is `client/pages/api/contact.ts` (Resend mailer).

## Common commands

All commands run from `client/`.

```bash
yarn dev            # Next dev server with Turbopack on :3000
yarn build          # Production build
yarn analyze        # Build with @next/bundle-analyzer enabled
yarn start          # Production server
yarn format         # Prettier-write components/ and pages/
yarn typecheck      # tsc --noEmit
yarn test           # Vitest unit tests (test/unit/)
yarn e2e            # Playwright e2e + axe a11y (serves the build on :3100)
yarn test:all       # Vitest then Playwright
```

There is **no `lint` script** — ESLint runs through Next's build-time check (currently disabled via `eslint.ignoreDuringBuilds`), and TypeScript build errors are bypassed via `typescript.ignoreBuildErrors: true` in `next.config.js`, so run `yarn typecheck` before pushing. Tests **do** exist now: Vitest for unit (`test/unit/`) and Playwright + axe-core for e2e/a11y (`test/e2e/`). The Playwright `webServer` runs `yarn start -p 3100`, so a production build must succeed first.

Path alias: `@/*` → `client/*` (see `tsconfig.json`).

## Architecture

### Fully static frontend

The home page composes section components from `client/components/site/`, in this order:

```
SiteNav → Hero → Work → Impact → Showcase → Process → Experience → Stack → About → Contact → Footer
```

All visible copy is content-driven, so text edits never touch components:

- `client/lib/redesign-content.ts` — hero, work, impact, showcase, process, experience, about, contact copy.
- `client/lib/technologies.json` — the searchable Stack / tech-showcase tile data.

Theme is light/dark via `next-themes` (toggle in `SiteNav`). Every motion is gated by `useReducedMotion()` from framer-motion. `client/components/site/primitives.tsx` holds small shared building blocks.

### Dark-mode 3D scene

Light mode shows the portrait; dark mode swaps in a three.js / React Three Fiber scene, behind a dynamic import so three.js only loads for dark-mode visitors whose browser supports WebGL:

- `components/site/DarkSpace.tsx` — gate (dark theme + WebGL check) that code-splits the scene.
- `components/site/SpaceBackground.tsx` — fixed full-page backdrop: a custom-shader starfield plus Mars / Jupiter / Saturn / Neptune that drift through the side margins as you scroll. Planet surfaces are generated procedurally on a `<canvas>`; only Earth uses a texture (`public/textures/earth-blue.jpg`).
- `components/site/HeroGlobe.tsx` — the hero Earth globe: textured sphere, fresnel atmosphere halo, and tech-hub markers projected to screen coords each frame.
- `components/site/HeroGlobeMount.tsx` — DOM overlay of hub hit-dots + caption; the globe freezes while the pointer is over it so pins are easy to target.
- `client/lib/tech-facts.ts` — hub data (city, lat/lng, note); `client/lib/geo.ts` — lat/lng → unit-sphere vector (unit-tested in `test/unit/geo.test.ts`).

### Contact form

The only server-side surface is `client/pages/api/contact.ts`. It uses Resend to email submissions to `RESEND_TO_EMAIL`, with `replyTo` set to the visitor's email so replies go to their inbox. Validates name/email/message and fails-soft if `RESEND_API_KEY` is missing.

### Project images (when needed)

Commit screenshots to `client/public/projects/<slug>.webp` (where `<slug>` matches the project's `slug` field in `redesign-content.ts`). See `client/public/projects/README.md` for export conventions. Vercel + `next/image` optimize automatically.

### Deprecated backend

`server/` contains a previous Express + WebSocket + MongoDB + Clerk implementation that backed an admin dashboard CRUD. Not deployed today, not referenced from the build. Preserved as a reference if a backend is ever needed again. See `server/README.md`.

## Environment

`client/.env.local`:

```
RESEND_API_KEY=
RESEND_TO_EMAIL=kasomaibrahim@gmail.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

See `client/.env.example` for the full template. In Vercel, set these in **Settings → Environment Variables** for both Production and Preview environments.

If a sender domain has been verified in Resend (e.g. `kasomaibrahim.dev`), set `RESEND_FROM_EMAIL` to a verified address (`hello@kasomaibrahim.dev`); otherwise leave it as `onboarding@resend.dev`.

## Conventions and gotchas

- **Tailwind v4** is active via `@tailwindcss/postcss` in `postcss.config.mjs` plus `@theme inline` blocks in `client/styles/globals.css`. Don't reintroduce a `tailwind.config.js`.
- **Turbopack** is the active dev bundler (`next dev --turbo`). Webpack-specific tweaks in `next.config.js` will not apply in dev.
- **TS errors and ESLint warnings are ignored at build time** today. Run `yarn typecheck` before pushing to catch regressions, and `yarn test` / `yarn e2e` for the test suites.
- **Avatar pipeline:** the brush-stroke portrait at `client/public/icons/avarta-cutout.{png,webp}` was processed from the original `avarta.webp` to mask out white background pixels with full per-pixel color decontamination. If the source ever changes, see `docs/redesign.md` for the algorithm.
- **The redesign deleted ~25 legacy components and ~93 more files in the static migration** (dashboard, sign-in/up, Clerk, shadcn ui, dashboard hooks/lib, Jest, RTL, axios, swr, react-hook-form, etc.). If you find an older doc mentioning any of these, treat it as historical.
