# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

A **single Next.js app (App Router) at the repo root**, deployed on Vercel. TypeScript, Tailwind v4, Motion v12 (`motion/react`), Radix, Resend (contact form). Light (paper) theme only. The home page is statically prerendered; the only server-side code is `app/api/contact/route.ts` (Resend mailer).

**Branching:** the AI-era redesign lives on the long-lived `redesign/ai-era` branch. Phase PRs target `redesign/ai-era`, never `master`, until the whole redesign is ready — `master` still has the old `client/` layout and is what production deploys.

The old `client/` subfolder, deprecated Express/Mongo `server/`, `docs/`, and server-only GitHub workflows were removed on 2026-11-07 (see git history if any of it is ever needed).

## Common commands

All commands run from the repo root.

```bash
yarn dev            # Next dev server with Turbopack on :3000
yarn build          # Production build
yarn analyze        # Build with @next/bundle-analyzer enabled
yarn start          # Production server
yarn test           # Vitest unit tests (test/unit/)
yarn e2e            # Playwright E2E tests (test/e2e/)
yarn typecheck      # tsc --noEmit — keep this green
yarn seo:assets     # Regenerate favicons + og.png from public/favicon.png (Playwright)
yarn format         # Prettier-write components/ and app/
```

ESLint is not installed. TypeScript build errors are bypassed via `typescript.ignoreBuildErrors: true` in `next.config.js`, so run `yarn typecheck` before pushing.

Path alias: `@/*` → repo root (see `tsconfig.json`).

## Architecture

### Component layers

Composition flows one way — each layer only imports from the layers above it:

1. **Tokens** — `styles/globals.css`: colours, typefaces, the `text-display-{xs..xl}` type scale, `.feature-invert`. A type or palette change is a token change.
2. **Primitives** — `components/ui/`: `Container` (the `.wrap`: 1248px content box, 96px margins at 1440), `Heading`/`Text`/`Eyebrow`, `Button`/`ButtonLink`/`Arrow`, `TextLink`, `BulletList`/`TagList`, `cn`. Server-safe, no state.
3. **Motion** — `components/motion/`: `RiseText` (CSS-only hero entrance, server-safe), `CountUp`, `GrowBar` (client). No scroll-reveals: content is at rest when scrolled to (a hidden-until-scrolled block also traps keyboard focus on invisible content). Never branch on `useReducedMotion()` for SSR'd start states — React won't patch the stranded inline style on hydration; handle reduced motion in CSS (`[data-grow]`, `.rise-word`, `.enter-up`).
   - **Hero** — `components/hero/InkPortrait.tsx` + `ink-gl.ts`: the page's one effect. Raw WebGL1 ink shader over a priority `<Image>`, loaded after idle; dry frame == the image, so it swaps in invisibly. A face `protect` ellipse (from `hero.avatarProtect` in content) keeps the person still while the ink runs. Skipped under reduced motion / no WebGL.
4. **Patterns** — `components/patterns/`: compound `Section` (`Section.Header/Title/Intro/Body`, renders a `<div>` scroll target), `Band` (the full-bleed `<section>` that sits directly in `<main>`).
5. **Sections** — `components/sections/`: one per page section. Server Components by default; `'use client'` only where there is real state (SiteNav, ProjectCard, Contact, and `components/demo/DemoConsole`).

### Content

Every visible string on the home page comes from:

- `lib/redesign-content.ts` — hero, stats, skills, work, showcase, experience, currently, about, contact.
- `lib/technologies.json` — the searchable Tech Showcase tile data.

`app/page.tsx` composes: `Hero → Demo → Work → Impact → Showcase → Experience → About → Contact`, plus `SiteNav` and `Footer`. Metadata lives in `app/layout.tsx` (Metadata API); JSON-LD is rendered in `app/page.tsx`.

### Live demo (generative UI) — `lib/demo/`, `components/demo/`, `app/api/demo/route.ts`

A free model answers questions about the site by calling **grounded tools** and the answer renders as the site's own components. No fine-tuning: the model only knows what tools return.

- `lib/demo/catalog.ts` — pure queries over `redesign-content.ts` (`findWork`, `getImpact`, `getExperience`, `getStack`, `getContact`). The single source of truth; every figure on screen comes from here.
- `lib/demo/tools.ts` — AI SDK v7 `tool()` wrappers (zod-validated). `lib/demo/types.ts` — `DemoUIMessage` inferred from the tools + `DemoMetadata` (source/model/timings for the notes).
- `lib/demo/providers.ts` — free-tier chain + system prompt: Groq `gpt-oss-20b` → Groq `gpt-oss-120b` (separate quota) → Google `gemini-3.5-flash-lite` → offline. Answers speak *about* Ibrahim in the third person, never as him.
- `app/api/demo/route.ts` — buffers each provider's stream until its first content chunk; a provider that errors before that (quota/503/blocked) is skipped invisibly. Then `lib/demo/offline.ts`: a model-free keyword router that runs the same tools (scripted lead-ins for `lib/demo/prompts.ts`). `lib/demo/ratelimit.ts` — Upstash sliding window (12 / 10 min per IP); rate-limited visitors are served offline, not errored.
- `components/demo/results/registry.tsx` — tool → view (`CaseCards`, `ImpactChart`, `Timeline`, `StackField`, `ContactCard`), exhaustive via `satisfies`. `DemoConsole` (useChat) opens on `exampleMessages()` so the frame is never empty; `MarginNotes` is the "Show how" panel.
- Tests: `test/unit/demo.test.ts` (grounding, router, failover with `MockLanguageModelV4`); e2e runs with `DEMO_OFFLINE=1` (set in `playwright.config.ts`).
- **AI SDK v7 — don't write it from memory**: read `node_modules/ai/docs/`. Requires **Node 22+** (`.nvmrc`, `engines`).

### SEO / GEO / AEO

- `lib/seo.ts` — canonical origin (`https://www.kasomaibrahim.dev`, the www host; Vercel redirects the apex to it) and the JSON-LD builders (`Person`, `WebSite`, `ProfilePage`, project `ItemList`), all derived from `redesign-content.ts`. Metadata in `app/layout.tsx`, JSON-LD rendered by `app/page.tsx`; covered by `test/unit/seo.test.ts`.
- `public/` — `robots.txt` (AI crawlers explicitly allowed), `sitemap.xml`, `llms.txt`, `site.webmanifest`, `og.png`, `favicon.ico`.
- Icon set + `og.png` are generated by `yarn seo:assets` (`scripts/generate-seo-assets.mjs`) — rerun it if `public/favicon.png`, the avatar, or headline stats change. Google requires a square favicon ≥48px; the icon links live in the `icons` metadata in `app/layout.tsx`.

### Contact form

The only server-side surface is `app/api/contact/route.ts` (covered by `test/unit/contact-route.test.ts`). It uses Resend to email submissions to `RESEND_TO_EMAIL`, with `replyTo` set to the visitor's email so replies go to their inbox. Validates name/email/message and fails-soft if `RESEND_API_KEY` is missing.

### Project images (when needed)

Commit screenshots to `public/projects/<slug>.webp` (where `<slug>` matches the project's `slug` field in `redesign-content.ts`). See `public/projects/README.md` for export conventions. Vercel + `next/image` optimize automatically.

## Environment

`.env.local`:

```
RESEND_API_KEY=
RESEND_TO_EMAIL=kasomaibrahim@gmail.com
RESEND_FROM_EMAIL=onboarding@resend.dev
GROQ_API_KEY=                      # demo, primary (free tier)
GOOGLE_GENERATIVE_AI_API_KEY=      # demo, backup (free tier)
KV_REST_API_URL= / KV_REST_API_TOKEN=   # Upstash rate limit (Vercel Marketplace)
```

See `.env.example` for the full template. In Vercel, set these in **Settings → Environment Variables** for both Production and Preview environments.

If a sender domain has been verified in Resend (e.g. `kasomaibrahim.dev`), set `RESEND_FROM_EMAIL` to a verified address (`hello@kasomaibrahim.dev`); otherwise leave it as `onboarding@resend.dev`.

## Conventions and gotchas

- **Tailwind v4** is active via `@tailwindcss/postcss` in `postcss.config.mjs` plus `@theme inline` blocks in `styles/globals.css`. Don't reintroduce a `tailwind.config.js`.
- **Turbopack** is the active dev bundler (`next dev --turbo`). Webpack-specific tweaks in `next.config.js` will not apply in dev.
- **TS errors are ignored at build time** today. Run `yarn typecheck` before pushing to catch regressions.
- **Node 22+** for everything (AI SDK v7, the taste gate): `nvm use` (reads `.nvmrc`). The taste-skill gate (`~/.claude/skills/design-taste-frontend`) runs as `node …/scripts/gate.mjs` against `yarn start` on localhost. The page declares `data-type='software'` + `page-type`/`site-kind` metas. Reasoned waivers live in `.taste-skill/waivers.json` (the rest of `.taste-skill/` is local state, gitignored).
- **Playwright:** `reducedMotion` is not a `test.use` option — use `page.emulateMedia({ reducedMotion: 'reduce' })`.
- **Avatar pipeline:** the brush-stroke portrait at `public/icons/avarta-cutout.{png,webp}` was processed from the original `avarta.webp` to mask out white background pixels with full per-pixel color decontamination. The algorithm lived in `docs/redesign.md` (removed 2026-11-07; recover it from git history if the source changes).
- **The redesign deleted ~25 legacy components and ~93 more files in the static migration** (dashboard, sign-in/up, Clerk, shadcn ui, dashboard hooks/lib, Jest, RTL, axios, swr, react-hook-form, etc.). If you find an older doc mentioning any of these, treat it as historical.
