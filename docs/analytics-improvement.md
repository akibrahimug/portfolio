# Analytics — improvement plan

Status: **proposed, not started.** Author: 2026-05-01.

## TL;DR

- Current state: zero analytics. No idea what pages visitors land on, what referrers send traffic, or whether the contact form gets seen.
- Recommendation: **Vercel Web Analytics**. Native to the deploy you already have, free hobby tier, cookieless, no consent banner needed.
- Implementation is one package + one component. Single PR.
- Switch to **Cloudflare Web Analytics** later if/when Phase 1 of the Cloudflare migration happens — same zero-cost, more portable.
- Do not install **Google Analytics**. It's free but it costs you a cookie banner, GDPR overhead, and the slowest script on the page.

## Current state

No analytics tooling. The site has no `<script>` tags from third parties, no telemetry, no error monitoring. Lighthouse scores are clean for that reason — every analytics choice trades a few points of performance and a chunk of complexity for visibility. Pick the one that costs the least of both.

## Options compared

| Option | Cost | Cookies | GDPR consent? | Script size | Custom events | Notes |
|---|---|---|---|---|---|---|
| Vercel Web Analytics | Free hobby tier (page views generous, custom events limited) | No | No | ~1 KB | Yes (paid scale) | Native to Vercel deploy. |
| Cloudflare Web Analytics | Free, unlimited | No | No | ~3 KB | No | Requires either DNS-on-Cloudflare or a JS snippet. Snippet works without DNS migration. |
| GoatCounter | Free for personal use | No | No | ~3 KB | Limited | No account required for self-host; cloud is hosted by maintainer, donation-supported. |
| Plausible (cloud) | €9/mo+ | No | No | ~1 KB | Yes | Out of scope (paid). |
| Umami (self-hosted) | Free + your hosting | No | No | ~2 KB | Yes | You run the server (Vercel + Postgres). Not worth the ops for a portfolio. |
| Posthog | Generous free tier | Yes (configurable) | Often yes | ~30 KB+ | Yes (heavy product analytics) | Too much for a portfolio. Consider only if you're recording sessions or running A/B tests. |
| Google Analytics 4 | Free | Yes | Yes | ~50 KB+ | Yes | Slow, ad-tech-tainted, requires consent banner. **Don't.** |

## Recommendation: Vercel Web Analytics

Reasons in order of weight:

1. **Zero infrastructure friction.** It ships from the same vendor that hosts the site. Install is one yarn add + one component.
2. **No consent banner.** Cookieless, no PII, no third-party identifiers — the GDPR e-Privacy directive does not require consent for this kind of measurement.
3. **Performance budget.** ~1 KB script, deferred load. Doesn't move the needle on Core Web Vitals.
4. **Reasonable feature set for a portfolio.** Page views, top pages, top sources, devices, countries. Custom events available (e.g., "contact form submitted") within the free tier.
5. **Reversible.** If Vercel ever shuts the free tier or you migrate hosting, the snippet is one import — replace it with Cloudflare or GoatCounter in 10 minutes.

## Implementation

Single PR, ~3 file diff.

### Step 1 — Install

```bash
cd client
yarn add @vercel/analytics
```

### Step 2 — Mount the component

In `client/pages/_app.tsx`, add:

```tsx
import { Analytics } from '@vercel/analytics/react'
// ...
<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
  <Component {...pageProps} />
  <Analytics />
</ThemeProvider>
```

That's the entirety of the integration for page-view tracking. The component injects a deferred script in production and is a no-op in dev.

### Step 3 — (Optional) custom event for contact form

If you want to track contact-form submissions specifically:

```tsx
import { track } from '@vercel/analytics'
// in Connect.tsx onSubmit, after a successful response:
track('contact_form_submitted')
```

This counts against custom-event limits but lets you see the conversion funnel (visitors → form-submitters) in the Vercel dashboard.

### Step 4 — Enable in Vercel dashboard

Project Settings → Analytics → enable Web Analytics. The data starts populating within ~1 minute of the next deploy.

### Step 5 — Verify

After deploy, open the live site, visit a few pages, then check Vercel → Analytics. Page views should show up in real-time view. If they don't, the most common cause is an ad blocker on your dev machine — try an incognito window or a different network.

## Risks and gotchas

- **Hobby tier limits.** Free tier covers 2,500 events/month for hobby projects (subject to Vercel's pricing changes). For a personal portfolio this is plenty. If you ever exceed, the dashboard nags you to upgrade — it doesn't break the site.
- **Ad blockers.** uBlock Origin, Brave Shields, etc. block the `_vercel/insights` endpoint. Expect 10-30% of traffic to be invisible. This is true for every analytics tool that runs JS — the alternative (server-side rendering analytics from Vercel logs) is paid and not worth it for a portfolio.
- **Lock-in.** The events live in Vercel's dashboard with no easy export. If portability matters, switch to GoatCounter or Plausible (paid) which both have export endpoints. For a personal portfolio, this rarely matters.
- **No funnel/cohort analysis.** Vercel Web Analytics is intentionally simple — no retention curves, no SQL, no cohorts. For a portfolio, that's fine. If product-analytics features are ever needed, Posthog is the upgrade path.

## What does *not* change

- The site continues to work without consent banners.
- No new env vars.
- No new server-side code.
- No new endpoints.
- Lighthouse score effectively unchanged (1 KB deferred script).

## Future option: Cloudflare Web Analytics

If/when Phase 1 of the Cloudflare migration happens (see `docs/cloudflare-migration.md`), Cloudflare Web Analytics becomes a natural drop-in replacement. Tradeoffs vs Vercel:

- **Pro:** unlimited events, fully privacy-respecting, single dashboard alongside DNS/email.
- **Con:** no custom events. Slightly larger script (~3 KB vs 1 KB). Less elegant integration with a Vercel deploy.

Worth switching only if you want to consolidate vendors at Cloudflare, not as a feature-driven move.

## Decision

Default to Vercel Web Analytics. Install whenever you want — there is no urgency, no dependency, no breakage risk. The whole change is reversible in 30 seconds (`yarn remove @vercel/analytics` + delete the import).

A reasonable trigger: install it the same day you add the contact-form custom event, so you can see both page views and conversions from day one.
