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
```

There is no `lint` or `test` script today. Tests were removed alongside the dashboard CRUD they exercised. New test infra (Playwright for E2E, Vitest for unit) can land separately when needed. ESLint runs through Next's build-time check (currently disabled via `eslint.ignoreDuringBuilds`). TypeScript build errors are bypassed via `typescript.ignoreBuildErrors: true` in `next.config.js`.

Path alias: `@/*` → `client/*` (see `tsconfig.json`).

## Architecture

### Fully static frontend

Every visible string on the home page comes from two files:

- `client/lib/redesign-content.ts` — hero, stats, skills, work, showcase, process, experience, currently, about, contact.
- `client/lib/technologies.json` — the searchable Tech Showcase tile data.

The home page composes 12 sections defined under `client/components/redesign/`:

```
Hero → StatsBand → TickerStrip → Skills → SelectedWork → Showcase
     → Process → Experience → TechShowcase → Currently → About → Connect
```

Plus `TopNav` and `ScrollProgress` above and `RedesignFooter` below. Theme is light/dark via `next-themes` — toggle in `TopNav`. Every motion is gated by `useReducedMotion()` from framer-motion.

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
- **TS errors and ESLint warnings are ignored at build time** today. Run `npx tsc --noEmit` before pushing to catch regressions.
- **Avatar pipeline:** the brush-stroke portrait at `client/public/icons/avarta-cutout.{png,webp}` was processed from the original `avarta.webp` to mask out white background pixels with full per-pixel color decontamination. If the source ever changes, see `docs/redesign.md` for the algorithm.
- **The redesign deleted ~25 legacy components and ~93 more files in the static migration** (dashboard, sign-in/up, Clerk, shadcn ui, dashboard hooks/lib, Jest, RTL, axios, swr, react-hook-form, etc.). If you find an older doc mentioning any of these, treat it as historical.
