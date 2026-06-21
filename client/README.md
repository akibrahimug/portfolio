# Portfolio Frontend

The deployed Next.js app for **kasomaibrahim.dev** — a fully static personal portfolio with a light/dark theme and a dark‑mode interactive 3D space scene.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/three.js-r184-000?style=for-the-badge&logo=three.js)](https://threejs.org/)

## 📝 Description

A single Next.js (Pages Router) application, statically rendered and deployed on Vercel. Every visible string on the home page is content‑driven (`lib/`), so copy changes never touch components. The only server‑side surface is `pages/api/contact.ts`, a Resend‑backed mailer.

## ✨ Features

- 🪐 **Dark‑mode space scene** — a full‑page starfield (custom GLSL points) plus Mars, Jupiter, Saturn (with rings) and Neptune that drift through the side margins as you scroll. Planet surfaces are generated procedurally on a canvas; Earth uses a texture.
- 🌍 **Interactive hero globe** — a three.js Earth with a soft atmosphere halo and hoverable tech‑hub pins. The globe freezes while the pointer is over it so pins are easy to target; each pin shows a city + note.
- ☀️ **Light / dark theme** via `next-themes` — light mode shows the portrait; dark mode shows the globe + space scene.
- ♿ **Motion‑ and capability‑aware** — all animation is gated by `useReducedMotion`, and the WebGL scene is code‑split so three.js only loads for dark‑mode visitors with WebGL support.
- ✉️ **Contact form** with client + server validation, posting to a Resend mailer.
- ⚡ Fully static output, optimized images via `next/image`, Turbopack dev server.

## 🚀 Getting started

```bash
yarn install
yarn dev          # http://localhost:3000 (Turbopack)
```

Create `client/.env.local` (see [`.env.example`](.env.example)):

```env
RESEND_API_KEY=re_...
RESEND_TO_EMAIL=kasomaibrahim@gmail.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

The contact form fails soft if `RESEND_API_KEY` is missing, so the rest of the site runs without any env vars.

## 🛠️ Scripts

| Script | What it does |
| --- | --- |
| `yarn dev` | Dev server with Turbopack |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn analyze` | Build with `@next/bundle-analyzer` |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn test` | Unit tests (Vitest, jsdom) |
| `yarn test:watch` | Vitest in watch mode |
| `yarn e2e` | End‑to‑end + a11y tests (Playwright) |
| `yarn test:all` | Vitest then Playwright |
| `yarn format` | Prettier‑write `components/` and `pages/` |

## 🧪 Testing

- **Unit** — Vitest + Testing Library (`test/unit/`): content model, contact form, interactions, geo math.
- **E2E / a11y** — Playwright (`test/e2e/`): home, theme toggle, contact flow, and an axe‑core accessibility pass. Runs against `yarn start` on port 3100.

## 🏗️ Structure

```
client/
├── components/site/   # the home page sections + the 3D scene
│   ├── DarkSpace.tsx        # dark-mode + WebGL gate; code-splits the scene
│   ├── SpaceBackground.tsx  # full-page starfield + scroll-revealed planets
│   ├── HeroGlobe.tsx        # three.js Earth, atmosphere halo, hub markers
│   ├── HeroGlobeMount.tsx   # DOM overlay for hub pins (hit-dots + caption)
│   └── …                    # Hero, Work, Impact, Showcase, Process, etc.
├── lib/
│   ├── redesign-content.ts  # all home-page copy
│   ├── technologies.json    # tech-showcase tile data
│   ├── tech-facts.ts        # globe tech-hub markers (city, lat/lng, note)
│   ├── geo.ts               # lat/lng → unit-sphere vector
│   └── email-*.ts           # contact mailer templates
├── pages/             # index, _app, _document, api/contact
├── public/            # icons, projects/, textures/ (earth-blue.jpg)
├── styles/            # globals.css (Tailwind v4 @theme)
└── test/              # unit/ + e2e/
```

## 🔧 Stack

- **Framework:** Next.js 16 (Pages Router, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`, no `tailwind.config.js`)
- **3D:** three.js + `@react-three/fiber`
- **Animation / theme:** Framer Motion, `next-themes`
- **UI:** Radix Dialog, Phosphor icons
- **Mail:** Resend
- **Testing:** Vitest, Testing Library, Playwright, `@axe-core/playwright`
- **Hosting:** Vercel

## 📜 License

MIT — Ibrahim Kasoma ([@akibrahimug](https://github.com/akibrahimug))
