# Portfolio — kasomaibrahim.dev

Personal portfolio for **Ibrahim Kasoma**, Senior Software Engineer (TypeScript · React · Node.js).

## Architecture

Single Next.js application, fully static, deployed on Vercel. Every visible string on the home page comes from `client/lib/redesign-content.ts`. The only server-side surface is `client/pages/api/contact.ts`, a Resend-backed mailer.

```
Visitor → Vercel CDN → Static HTML/CSS/JS
                     ↓
                  /api/contact → Resend → kasomaibrahim@gmail.com
```

A previous version backed by Express + MongoDB + Clerk lives under `server/` but is **deprecated** — preserved for history (see [`server/README.md`](server/README.md)).

## Stack

- **Framework:** Next.js 16 (Pages Router), TypeScript, Tailwind v4, Framer Motion
- **Theme:** light / dark via `next-themes`
- **Mail:** Resend (free tier 3,000 emails/month)
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
