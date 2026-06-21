# Portfolio — kasomaibrahim.dev

Personal portfolio for **Ibrahim Kasoma**, Senior Software Engineer (TypeScript · React · Node.js).

## Architecture

Single Next.js application, fully static, deployed on Vercel. Every visible string on the home page comes from `client/lib/redesign-content.ts`. The only server-side surface is `client/pages/api/contact.ts`, a Resend-backed mailer.

The home page is theme-aware: **light mode** shows the portrait, while **dark mode** renders an interactive 3D scene — a three.js Earth globe with hoverable tech-hub pins, plus a full-page starfield and planets (Mars, Jupiter, Saturn, Neptune) that drift through the margins as you scroll. The WebGL scene is code-split so three.js only loads in dark mode, and all motion respects `prefers-reduced-motion`.

```
Visitor → Vercel CDN → Static HTML/CSS/JS
                     ↓
                  /api/contact → Resend → kasomaibrahim@gmail.com
```

A previous version backed by Express + MongoDB + Clerk lives under `server/` but is **deprecated** — preserved for history (see [`server/README.md`](server/README.md)).

## Stack

- **Framework:** Next.js 16 (Pages Router), React 19, TypeScript, Tailwind v4, Framer Motion
- **3D:** three.js + React Three Fiber (dark-mode globe + space scene, code-split)
- **Theme:** light / dark via `next-themes`
- **Mail:** Resend (free tier 3,000 emails/month)
- **Testing:** Vitest (unit) + Playwright with axe-core (e2e / a11y)
- **Hosting:** Vercel

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — guidance for Claude Code (and humans) working in this repo
- [`docs/redesign.md`](docs/redesign.md) — page composition, content model, theme system, avatar pipeline, contact form
- [`docs/design-inspiration.md`](docs/design-inspiration.md) — research compendium of senior-FE / designer portfolios that shaped the design

## Local dev

```bash
cd client
yarn install
yarn dev          # http://localhost:3000
```

Environment variables in `client/.env.local`:

```
RESEND_API_KEY=re_...
RESEND_TO_EMAIL=kasomaibrahim@gmail.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

See [`client/.env.example`](client/.env.example).

## Deploy

Push to `master`. Vercel deploys automatically. Set the three Resend env vars under Vercel **Project Settings → Environment Variables** for both Production and Preview.

## License

MIT — Ibrahim Kasoma
