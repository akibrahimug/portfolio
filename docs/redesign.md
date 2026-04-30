# Public home page redesign

Reference for the redesigned public home page that ships on `FEATURE/full-redesign`.

## Why this exists

The previous home page was a category-grouped, avatar-led layout with a methodologies dropdown, a contact form, and a tech-stack marquee. It read junior. The redesign rebuilds the page top-to-bottom in the senior-IC lane (Lee Robinson · Emil Kowalski · Paco Coursey aesthetic, captured in `design-inspiration.md`): text-led, dark-default with a light-mode counterpart, single accent, restrained motion, content centralized.

## Page composition

`client/pages/index.tsx` composes 12 sections in this order:

1. **`Hero`** — Name + scramble role rotator + statement + status pill + dual CTAs. Brush-stroke avatar (light mode only) on the right at lg+. Numbers in the statement: 80+ apps shipped (career), and at EF specifically — seven concurrent projects, 3.4M+ users in 60+ markets on the flagship.
2. **`StatsBand`** — Four KPIs: 6+ years · 80+ apps · 7+ EF projects in parallel · 3.4M MAU on the flagship. Each animates a count-up on scroll-into-view (skipped under reduced-motion).
3. **`TickerStrip`** — Single mono ticker of stack labels with edge masks. Static row under reduced-motion.
4. **`Skills`** — Six grouped skill clusters from the CV (Frontend / Backend & APIs / Cloud & Delivery / Architecture & Tooling / Testing & Reliability / Platforms).
5. **`SelectedWork`** — Three EF surfaces in descending year, each card is a single anchor that opens the live URL in a new tab:
   - 2026 EF EPI — `https://www.ef.com/epi`
   - 2025 EF Homepage — `https://www.ef.com`
   - 2024 EF Programs — `https://www.ef.com/pg`
6. **`Showcase`** — Six side-projects / freelance builds with both Live site and Repo links. The card itself is the live anchor; the inner Repo button uses `role="button"` + `stopPropagation` to route to the repo without triggering the card-wide navigation. Items: comp-lib · DevOps Insights · Learner · Puur Uganda Reizen · Oliotya Uganda Safaris · IGCFashion.
7. **`Process`** — Four-step "Discover · Architect · Ship · Iterate". Cards expand on click — the opened card spans the full row width and reveals four senior-coded bullets per step. AnimatePresence + height animation, `aria-expanded` for screen readers, honors reduced-motion.
8. **`Experience`** — CV timeline (EF · San Damiano · Freelance) plus an Education footer. EF role bullets are the CV verbatim.
9. **`TechShowcase`** — Searchable tile bar over `client/lib/technologies.json`. Tile click opens a modal with description + confidence bar. Marquee animation at rest, static when query is non-empty or reduced-motion is on.
10. **`Currently`** — Four mini-cards: Shipping · Building · Reading · Open to. Has an "Updated April 2026" timestamp.
11. **`About`** — CV professional summary verbatim. Heading aligned with the CV title line.
12. **`Connect`** — Email pill + Copy email button + three social links + a contact form that posts via `useCreateMessage()`.

Plus `TopNav` (sticky, scroll-aware backdrop blur, theme toggle) above and `ScrollProgress` (spring-smoothed top bar) and `RedesignFooter` around it.

## Content module pattern

Every string on the home page comes from a single typed export at `client/lib/redesign-content.ts`. The shape:

```ts
export const redesignContent = {
  meta: { title, description },
  nav: { brand, links: [{ href, label }] },
  hero: { eyebrow, name, rolePool, statement, status, location, primaryCta, avatarSrc, avatarAlt },
  stats: { eyebrow, items: [{ value, suffix, label, sub }] },
  ticker: string[],
  skills: { eyebrow, heading, groups: [{ label, items }] },
  work: { eyebrow, heading, items: [{ slug, year, title, role, summary, stack, metric, live }] },
  showcase: { eyebrow, heading, body, items: [{ slug, kind, title, summary, stack, live, repo }] },
  process: { eyebrow, heading, body, steps: [{ n, title, body, details: string[] }] },
  experience: { eyebrow, heading, roles, education },
  tech: { eyebrow, heading, body },
  currently: { eyebrow, heading, asOf, items: [{ k, v }] },
  about: { eyebrow, heading, paragraphs, facts: [{ k, v }] },
  contact: { eyebrow, heading, body, email, socials },
  footer: { line, repo },
} as const

export type RedesignContent = typeof redesignContent
```

To rewrite copy, edit this one file. Do not push strings into individual components.

## Theme system

Light/dark via `next-themes` (`ThemeProvider` configured in `pages/_app.tsx` with `attribute='class' defaultTheme='system' enableSystem`). The toggle button is `components/redesign/ThemeToggle.tsx` — sun in dark mode, moon in light mode, persisted in `localStorage`.

Components use semantic Tailwind tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`) which adapt automatically. Specific colors that need to differ between modes use the `dark:` variant.

The avatar is intentionally **light-mode only**:
- `dark:hidden` on the avatar wrapper.
- `dark:lg:grid-cols-1` on the parent so the hero collapses to a single text-led column under dark.
- The avatar PNG/WebP is pre-processed to remove its white photo background — see "Avatar pipeline" below.

## Avatar pipeline

The original `client/public/icons/avarta.webp` has a white rectangular background that bled through against dark mode. A small node script (kept at `/tmp/remove-white-v2.mjs` during development; rerun by hand if the source changes) processes it:

1. **Luminance-based alpha mask** — pixels with `lum ≥ 232` become fully transparent, pixels with `lum ≤ 165` are fully opaque, between is a smooth ramp.
2. **Color decontamination** — partial-alpha pixels have the white spillage algebraically removed: `c_true = (c − (1−α)·255) / α`. Without this step, edge pixels show a pink/cream halo.

Output: `client/public/icons/avarta-cutout.{png,webp}`. The hero references the WebP; the PNG exists as a fallback.

## Motion

Every motion is gated by `useReducedMotion()` from framer-motion:

- Scroll progress bar uses `useScroll` + `useSpring` (`stiffness: 220, damping: 30`).
- Role rotator does a per-character glyph scramble (`useScramble` hook) with brand-red glow while settling, gray when locked. Static target text under reduced motion.
- Section reveals use mount-time `animate` (not `whileInView`) so content always renders even when the IntersectionObserver doesn't fire (Playwright fullPage capture, fast scroll, etc.).
- Hover affordances: card lift (`y: -4`), arrow shift (`translate-x-0.5`), color transition.

No GSAP. No Three.js. No Lenis. Single Framer Motion + Tailwind.

## What was removed

The redesign deleted ~25 legacy files. Anything in this list, **do not look for it on `FEATURE/full-redesign`**:

```
client/components/Header.tsx
client/components/HeroSection.tsx
client/components/ProfileDesc.tsx
client/components/Avarta.tsx
client/components/Bio.tsx
client/components/MainHeader.tsx
client/components/NavButtons.tsx
client/components/Methodologies.tsx
client/components/Projects.tsx
client/components/ProjectCard.tsx
client/components/TechStack-scroll.tsx
client/components/Contact.tsx
client/components/SocialMedia.tsx
client/components/AnimatedCardWrapper.tsx
client/components/Form.tsx
client/components/Pagination.tsx
client/components/portfolio/PortfolioCard.tsx
client/components/portfolio/PortfolioSection.tsx
client/components/portfolio/PreviewContent.tsx
client/lib/api.ts
client/lib/lightweight-animation.tsx
client/lib/validation.ts
client/pages/color-test.tsx
```

These were the old home-page components and their dependencies. Their roles were absorbed into `components/redesign/*`. The **Footer** legacy component is intentionally kept — it is rendered on non-home routes (dashboard, sign-in, sign-up) by `_app.tsx`.

The dashboard kept its dependencies: `lib/form-configs.ts`, `lib/file-utils.ts`, `lib/formatters.ts`, `lib/image-utils.ts`, `lib/schemas.ts`, `lib/portfolio-data.ts`, `hooks/usePortfolio.ts` are all still in use by `pages/dashboard/*`.

## What still depends on the backend

The redesigned public home is **almost** static. The only call into the Cloud Run + MongoDB stack from a public route is the contact form:

```
Connect.tsx → useCreateMessage() → POST {NEXT_PUBLIC_API_BASE_URL}/messages
```

To go fully static:

1. Replace the form with a third-party endpoint (Formspree, Resend, EmailJS, Vercel Functions). 5-line swap inside `Connect.tsx`.
2. Decide whether the admin dashboard is still useful. If yes, keep the backend deployed. If no, the dashboard pages can be removed and the server retired.

Today, with the dashboard live, the backend continues to host:

- `/api/v1/projects`, `/experiences`, `/technologies`, `/messages`, `/badges`, `/resumes`, `/avatars`, `/certifications` (CRUD).
- `/api/v1/assets/request-upload` + `/api/v1/assets/confirm` (GCS V4 signed-URL flow for direct browser uploads).
- `/api/v1/healthz`, `/api/v1/readyz`, `/api/v1/stats` (health and metrics).
- `/api/v1/ws` (WebSocket; stats only).

## Adding or editing a project

Selected Work (the EF surfaces) and Showcase (everything else) are arrays in `redesignContent`. To add a project:

```ts
// In redesignContent.work.items — for EF live surfaces
{
  slug: 'unique-slug',
  year: '2026',
  title: 'Display title',
  role: 'Role line',
  summary: '2-3 sentences.',
  stack: ['Next.js', 'TypeScript', 'Tailwind'],
  metric: 'A short impact line · numbers preferred',
  live: 'https://www.example.com',
}

// In redesignContent.showcase.items — for side / freelance
{
  slug: 'unique-slug',
  kind: 'Domain · Sub-kind',
  title: 'Display title',
  summary: 'Short paragraph.',
  stack: ['React', 'TypeScript'],
  live: 'https://example.vercel.app',
  repo: 'https://github.com/akibrahimug/example',
}
```

Verification before commit:

1. Visit the live URL — confirm it returns 200 and looks reasonable.
2. Check the repo URL — confirm it exists and is public.
3. Year (Selected Work only) should be in descending order in the array.
4. `metric` is only for Selected Work; Showcase has no metric line.

## Cleanup script reference

The avatar cutout pipeline is not committed to package scripts (it is a one-off). If the avatar source changes, rerun:

```bash
# 1. Replace client/public/icons/avarta.webp with a new source.
# 2. From a Node 20 shell, run a script equivalent to:
#    - read avarta.webp, alpha-mask via luminance ramp 165→232,
#    - decontaminate edge pixels, write avarta-cutout.{png,webp}.
# Reference implementation lived at /tmp/remove-white-v2.mjs during development.
```

If the cutout starts showing a halo again after a source swap, the most likely cause is JPEG-style chroma ringing — tighten the SOFT threshold from 165 toward 180.
