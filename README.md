# Portfolio — kasomaibrahim.dev

Personal portfolio for **Ibrahim Kasoma**, senior frontend engineer.

It's a single Next.js app (App Router, React 19.3, TypeScript, Tailwind v4), deployed on Vercel. Two things make it more than a static page:

- **A live AI demo.** Visitors ask about Ibrahim's work, and a free model answers with the site's own components (project cards, charts, a timeline), built from the site's real data.
- **Five in-depth case studies** at `/work/<slug>`, with figures sourced from the CV and project READMEs.

The home page renders statically. The only server-side code is two route handlers: the demo (`app/api/demo`) and the contact form (`app/api/contact`).

---

## What's on the page

```
Hero → Live demo → Case studies → Experience → About → Contact
```

- **Hero:** an editorial headline with an **ink-shader portrait** (raw WebGL, no libraries). Moving the pointer or dragging on touch makes the ink run, and it dries back. The face is masked off so it never smears. The portrait falls back to the plain image under reduced motion or without WebGL.
- **Live demo:** visitors type a question or pick a suggested one. When the section first comes into view it plays its example answer as if live. A **"Show how"** toggle opens footnotes explaining each answer: which model answered, which lookups it ran, and timings.
- **Sticky ask bar:** while the demo section is out of view (and on every case-study page), an ask bar sits under the nav. It is the **same conversation** as the section. Answers drop down over the page, and Esc, ✕, clicking outside or following a link in the answer closes the panel, leaving the reader where they were.
- **Case studies:** EF EPI, EF Programs, the platform behind ef.com, Learner and comp-lib. Each has a lead figure, a framed screenshot that morphs between the index and its page (React `<ViewTransition>`), and Project / Problem / What I did / What changed chapters. Below them is a "More work" grid.
- **Experience, About, Contact:** Experience matches the CV, About is in Ibrahim's own words, and the page closes with the email address set large.

## How the live demo works

The model never sees free-form facts about Ibrahim; it can only call **grounded tools** over the site's content. No fine-tuning is involved.

| Piece | Where |
|---|---|
| Pure queries over the content (`findWork`, `getImpact`, `getExperience`, `getStack`, `getContact`) | `lib/demo/catalog.ts` |
| AI SDK v7 tools wrapping them. The model sees compact results; the UI gets the full data. | `lib/demo/tools.ts` |
| Free-model chain and system prompt | `lib/demo/providers.ts` |
| Streaming route with failover | `app/api/demo/route.ts` |
| Model-free fallback router over the same tools | `lib/demo/offline.ts` |
| Per-visitor rate limit (Upstash, 20 per 10 min) | `lib/demo/ratelimit.ts` |
| Tool → component registry (exhaustive, enforced by the compiler) | `components/demo/results/registry.tsx` |
| One shared conversation for the section and the bar | `components/demo/DemoChatProvider.tsx` |

**Model chain.** Every rung is a free tier, so spend is $0:

1. Groq `gpt-oss-20b`
2. Groq `gpt-oss-120b` (Groq quotas are per model, so this is a second quota)
3. Google `gemini-3.5-flash-lite`
4. **Offline router.** No model is involved, but it runs the same tools, so the data is still real. It answers common question shapes specifically ("how many years", "does he know X").

**Failure handling:**

- A provider that fails before producing any content is **skipped invisibly**.
- If one breaks *after* its results are on screen (for example, a tokens-per-minute limit between steps), or finishes without writing a sentence, the next provider writes just the sentence from those results.
- A rate-limited visitor gets offline answers with an honest note, never an error.

**Guardrails** come from the instructions and the data shape:

- Answers speak about Ibrahim in the third person.
- They never claim scope the data doesn't state (no "in production" unless it says so).
- Off-topic questions and prompt injection are refused.
- `getImpact` and `getStack` deliberately take no area filter, because small models kept over-narrowing broad questions.
- `getStack` never returns an empty result: an unmatched query returns the whole stack flagged `matched: false`.

## Architecture

Composition flows one way; each layer only imports from the layers above it.

1. **Tokens:** `styles/globals.css`. Colours (light paper theme, red accent), typefaces (Newsreader display + Hanken Grotesk body) and the `text-display-*` type scale. A type or palette change is a token change.
2. **Primitives:** `components/ui/`. `Container` (the `.wrap` content box), `Heading` / `Text` / `Eyebrow`, `Button` / `ButtonLink`, `TextLink`, `BulletList` / `TagList`, and `FigureText`, which sets figures inside running text in the serif instead of using a strip of stats.
3. **Motion:** `components/motion/`. `RiseText` (CSS-only hero entrance) and `GrowBar`. There are no scroll-reveals, and reduced motion is handled in CSS, never by branching during SSR.
4. **Patterns:** `components/patterns/`. A compound `Section` (`Section.Header / Title / Intro / Body`) and `Band` (the full-bleed `<section>` in `<main>`).
5. **Sections and features:** `components/sections/`, `components/case-study/`, `components/demo/`, `components/hero/`. These are Server Components unless they hold state.

**Content.** Every visible string lives in a content file:

- `lib/redesign-content.ts`: hero, skills, work, experience, about, contact, impact figures.
- `lib/case-studies.ts`: the five case studies. Every claim carries a `// src:` note. Unsourced details go in `openQuestions` and are never rendered.
- `lib/technologies.json`: the technology list with depth of experience.

**SEO and AEO:**

- Canonical host is `https://www.kasomaibrahim.dev`.
- JSON-LD (`Person`, `WebSite`, `ProfilePage`, a project `ItemList`, and a `CreativeWork` + breadcrumbs per case study) is built in `lib/seo.ts`.
- `app/sitemap.ts` and `app/llms.txt/route.ts` are **generated from content**, so they can't drift from the pages.
- Run `yarn seo:assets` after changing the favicon, the portrait or the headline to regenerate the icons and `og.png`.

## Local development

Requires **Node 22+** (AI SDK v7). Run `nvm use` to read `.nvmrc`.

```bash
yarn install
cp .env.example .env.local   # then fill in the keys below
yarn dev                     # http://localhost:3000
```

| Variable | For | Notes |
|---|---|---|
| `RESEND_API_KEY`, `RESEND_TO_EMAIL`, `RESEND_FROM_EMAIL` | Contact form | Fails soft without a key |
| `GROQ_API_KEY` | Demo, primary models | Free tier at console.groq.com |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Demo, backup model | Free tier at aistudio.google.com |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Demo rate limit | Upstash via the Vercel Marketplace. Without them there's no limiter. |
| `DEMO_OFFLINE=1` | Optional | Forces the model-free router |

Without any model keys, the demo still works through the offline router.

Locally every request shares one rate-limit key, so heavy manual testing trips the limit. When that happens, answers come from the offline router, with an inline note.

## Scripts

```bash
yarn dev          # Next dev server (Turbopack)
yarn build        # production build
yarn start        # serve the production build
yarn typecheck    # tsc --noEmit — keep green (build skips type errors)
yarn test         # Vitest unit tests (test/unit)
yarn e2e          # Playwright e2e, desktop + mobile, incl. axe (test/e2e)
yarn seo:assets   # regenerate favicons + og.png
yarn analyze      # build with the bundle analyzer
```

**What the tests cover:**

- **Unit tests:** content grounding, the offline router, provider failover and the finisher (with `MockLanguageModelV4`), compact model outputs, structured data, the contact route, and `FigureText` / `RiseText`.
- **End-to-end tests:** case-study flows; the demo section and the sticky bar (visibility, the shared conversation, closing in place); the ink portrait; reduced motion; no horizontal overflow at 320/390px; and axe.
- **Determinism:** e2e runs the demo with `DEMO_OFFLINE=1`, so it's deterministic and spends no model quota.

The design is also checked against the `design-taste-frontend` skill's gate. Reasoned waivers are in `.taste-skill/waivers.json`.

## Deployment

Vercel builds from the **repo root**, on **Node 22.x**. The model keys need to be set for both Production and Preview.

The AI-era redesign is being built on the long-lived `redesign/ai-era` branch. Each phase opens a PR into it, and it merges to `master` (production) only when the whole redesign is ready.

## License

MIT — Ibrahim Kasoma
