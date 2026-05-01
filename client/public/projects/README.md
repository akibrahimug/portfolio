# Project screenshots

Project images live here, committed to the repo. Vercel + `next/image`
optimize them at request time.

## Convention

Use the same `slug` you put in `client/lib/redesign-content.ts` for the
project, and save as `<slug>.webp`:

```
public/projects/learner.webp
public/projects/comp-lib.webp
public/projects/devops-insights.webp
```

## Recommended export settings

- **Format:** `.webp` (best size/quality ratio in 2026; falls back to PNG if needed).
- **Resolution:** 1920×1200 (or the source aspect ratio, no taller than 1600).
- **Quality:** 80. Visually indistinguishable from 100, ~3× smaller.
- **Total budget:** keep each file under ~250 KB so the repo stays tiny.

## When to graduate to a CDN

If this directory grows past ~30 images or repo size starts to hurt
clones, move to **Vercel Blob** or **Cloudinary**. Swap in one place —
the `Showcase.tsx` component reads URLs from `redesign-content.ts`.
