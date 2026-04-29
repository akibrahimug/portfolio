# Design Inspiration: AI-2026 Senior Frontend Portfolios

A research compendium informing the modernization of this portfolio toward an AI-2026, "simple but powerful" aesthetic suitable for a UK-targeting senior frontend engineer.

All entries verified live (April 2026). Each claim is grounded in a URL listed in the Sources section.

---

## 1. Top portfolios

### 1. Brittany Chiang — [brittanychiang.com](https://brittanychiang.com)

**Role.** Senior Frontend Engineer (ex-Upstatement, Klaviyo). The canonical "serious frontend" folio.

**Top 3 patterns to steal.**
- Two-column scroll layout: fixed left rail with name + nav + socials, scrollable right rail with section content.
- Timeline-style experience entries showing role progression with date ranges and tech-tag pills.
- "Featured Projects" cards with subtle hover lift and tech-tag chips.

**Motion.** Restrained: section-aware nav highlighting, subtle hover translate on cards. No theatrics.
**Typography.** Inter sitewide. Big-but-quiet display, regular body, monospace section labels.
**Color.** Dark navy default, slate text, single teal accent.
**IA.** About → Experience → Projects → Archive (plus side links).
**Voice.** First-person, modest-confident.

### 2. Lee Robinson — [leerob.com](https://leerob.com)

**Role.** VP DevRel-turned-engineer at Cursor (ex-Vercel). Quiet authority play.

**Top 3 patterns.**
- Single-column reading layout, no hero image — name + one-line bio is the hero.
- Inline-link bio paragraph that doubles as nav (every noun is a link).
- "Featured writing" bulleted list rather than card grid.

**Motion.** Nearly none — page transitions only. A senior engineer signal.
**Typography.** Geist Sans + Geist Mono. Modest scale.
**Color.** Pure black/white dark mode, neutral grays. No accent — links use underline.
**IA.** Hero bio → Featured posts → Footer with all sections. Omits a dedicated "About".
**Voice.** First-person, plainspoken. *"I'm a developer and writer."*

### 3. Rauno Freiberg — [rauno.me](https://rauno.me)

**Role.** Interaction designer at Vercel. Reference for "design engineer" branding.

**Top 3 patterns.**
- Third-person bio repeated twice (compact + expanded) at the top.
- "Craft" page separate from "Projects" — a curated micro-interactions reel.
- Email-as-copyable element with a tiny copied state, no contact form.

**Motion.** Minimal at the surface, surgical inside case studies (scroll-driven progress bars and View Transitions API page changes).
**Typography.** Inter for UI, monospace for nav/keyboard hints. Tight tracking, small caps for labels.
**Color.** Off-white default with optional dark mode.
**IA.** Bio → Devouring Details → Craft → Projects → Field Notes.
**Voice.** Third-person, aphoristic.

### 4. Paco Coursey — [paco.me](https://paco.me)

**Role.** Webmaster at Linear (ex-Vercel). Defined the "vercel/linear web aesthetic".

**Top 3 patterns.**
- Bio + role pinned to top, then nothing but a list of named sections (Building, Projects, Writing, Now, Connect).
- Open-source projects (cmdk, Vaul, Sonner) listed as portfolio items — code IS the case study.
- A "Now" page instead of a long About.

**Motion.** Famous for spring-physics dialog/drawer transitions on his shipped components, but the folio itself is text-only.
**Typography.** Inter + monospace for code.
**Color.** Light or dark, no chrome. Black/white + gray.
**IA.** Building → Projects → Writing → Now → Connect.
**Voice.** First-person, slightly philosophical.

### 5. Emil Kowalski — [emilkowal.ski](https://emilkowal.ski)

**Role.** Design Engineer on the Linear Web team; author of Vaul, Sonner, an animations course.

**Top 3 patterns.**
- Time-sensitive announcement banner above the bio.
- "Today" section name instead of "About" — humanizes the bio.
- Projects listed by name + one-liner only, with deep links — restraint as flex.

**Motion.** Surgical: section reveals via Framer Motion `whileInView` with low-amplitude `y: 8 → 0` and 200–300ms spring.
**Typography.** Inter, tight scale (~16/20/32/48). Generous leading.
**Color.** Dark default, near-black bg, off-white text.
**IA.** Today → Projects → Writing → Newsletter → More.
**Voice.** First-person, designer-engineer tone.

### 6. Samuel Kraft — [samuelkraft.com](https://samuelkraft.com)

**Role.** Design Engineer at Raycast (ex-Tracklib). 13 years of experience.

**Top 3 patterns.**
- Visual-first project tiles with poster-style preview images.
- Inline mention of years-of-experience and current company in bio rather than a separate Experience section.
- Blog and projects co-equal in the IA.

**Motion.** Cards animate on hover with subtle scale + shadow lift. Project pages use scroll-pinned sections.
**Typography.** Inter + a serif for blog body — a notable counterpoint to the all-sans crowd.
**Color.** Dark default, near-black, single warm accent on hover.
**IA.** Hero (avatar + 1-paragraph bio) → Projects (visual tiles) → Writing.
**Voice.** First-person, confident-humble.

### 7. Olivier Larose — [olivierlarose.com](https://olivierlarose.com)

**Role.** Independent freelance frontend dev (Montreal). Awwwards-adjacent.

**Top 3 patterns.**
- Project list as a four-column table — Project | Category | Client | Year.
- Tech-stack tags appended after project description so recruiters scan quickly.
- "Currently building @N1" status line — live availability signal.

**Motion.** GSAP-heavy on hover (image reveal, scrambled text), Lenis smooth scroll, page transitions with overlay sweep.
**Typography.** Sans for body, large display sans for project titles. Heavy lowercase usage.
**Color.** White/cream background, ink black text — light-default exception.
**IA.** Hero bio → Project table → Blog → Contact.
**Voice.** First-person but understated.

### 8. Cyd Stumpel — [cydstumpel.nl](https://cydstumpel.nl)

**Role.** Award-winning freelance creative developer + conference speaker.

**Top 3 patterns.**
- Triple role identity ("Freelance Developer / Creative Engineer / Conference Speaker") rotated as the headline.
- "Available August 2026" availability badge — converts cold visitors.
- Project metadata pills tag the *techniques* used (Dev, Motion, GSAP, Three.js).

**Motion.** GSAP scroll-triggered reveals, Three.js scenes, CSS scroll-driven animations.
**Typography.** Sans display + body, modest scale — motion does the heavy lifting.
**Color.** Off-white with bold full-bleed project hero images.
**IA.** Hero → Featured work → Speaking → Blogs → About → Contact.
**Voice.** First-person, playful.

### 9. Maël Ruffini — [maelruffini.com](https://maelruffini.com)

**Role.** Creative developer freelancing in Paris. Awwwards Honorable Mention 2025.

**Top 3 patterns.**
- X/Y coordinate indicators in the corners — turns the page into a "canvas" frame.
- Numbered carousel slides per project (1, 2, 3) instead of long scrolling case studies.
- Concrete client/agency credits — collaboration as credibility.

**Motion.** GSAP + Barba.js page transitions, Three.js 3D moments, smooth scroll. Infinite-scroll project section.
**Typography.** Modest-scale sans, monospace for coordinate labels.
**Color.** Strict #FFFFFF / #000000.
**IA.** Work → Informations → Entries.
**Voice.** Concise.

### 10. Maxime Heckel — [maximeheckel.com](https://maximeheckel.com)

**Role.** Frontend engineer (NYC) specializing in shaders, raymarching, post-processing.

**Top 3 patterns.**
- Hero shows a 0.00 → 1.00 progress bar visualization — a recurring motif that brands the site.
- Work organized thematically (shaders / post-processing / raymarching / interaction patterns).
- "Inspiration board" page — meta-transparency about influences.

**Motion.** Physics-coupled drag/resize interactions in the blog; in-article interactive shader playgrounds.
**Typography.** Sans body + monospace for code/numbers; technical aesthetic.
**Color.** Dark default; accent emerges via shader gradients embedded in components.
**IA.** Index → About → Work → Contact, plus blog.
**Voice.** First-person warm.

### 11. Tim Holman — [tholman.com](https://tholman.com)

**Role.** Veteran frontend engineer (Squarespace, Carta).

**Top 3 patterns.**
- Asymmetric repeated-name hero ("Tim Holman Holman Tim") — playful identity moment.
- Inline-link CV — work history is a paragraph, not a timeline.
- Experiments (Generative Artistry, Console.frog, Elevator.js) **are** the portfolio.

**Motion.** Static homepage, but each linked experiment is a motion piece.
**Typography.** System sans.
**Color.** Light default with blue links.
**IA.** Bio paragraph → Experiments → Roles → Contact. No nav.
**Voice.** Irreverent.

### Reference brands (not personal sites — the source aesthetic)

- **[Linear](https://linear.app)** — Numbered sections (1.0 → 5.0) for narrative; "Designed for the AI era" hero; tight Inter Display + warm grayscale + single coral/violet accent.
- **[Vercel](https://vercel.com)** — Geist Sans/Mono; pure black dark-default; glowing pulse network nodes; dual CTA pattern.
- **[Anthropic](https://anthropic.com)** — Warm earth-tone neutrals (cream, sand, brick) — the only major AI brand departing from cold mono. Serif + sans pairing for editorial feel.

### A note on UK senior engineers

I searched explicitly for personal portfolios from engineers at Monzo, Wise, GoCardless, Octopus Energy, Cleo, Pleo, and Paddle. **Most don't run public portfolios** — UK fintech engineering signals through LinkedIn + GitHub + occasional eng-blog posts on the company site. The closest equivalent for "UK-coded senior FE folio" is leerob.com / paco.me / emilkowal.ski — restrained, content-led, no theatrics. **For a UK-targeting senior FE folio, that template is the right anchor.**

---

## 2. Patterns to steal

### Hero patterns (pick 1–2; do not combine all)

1. **One-line role + one-line value-prop.** *"Frontend Engineer. I build accessible, pixel-perfect experiences for the web."* — Brittany. Lowest risk, reads senior.
2. **Inline-link bio paragraph.** Every noun a link — name, current employer, location, side projects. — Lee Robinson. Replaces nav for visitors who scroll.
3. **Multi-hyphenate role rotation.** *"Senior Frontend Engineer / Design-curious / UK-based"* — Cyd Stumpel does this. Use sparingly; one stable headline + a small rotating subtitle reads better than a noisy text-rotator.
4. **Availability/now-status badge.** *"Available July 2026"* or *"Currently shipping at $COMPANY"* — Cyd, Paco. Converts intent.
5. **Coordinate / progress motif as visual anchor.** Maël Ruffini's X/Y corner labels and Maxime Heckel's 0.00→1.00 bar replace the hero illustration with a typographic motif. Cheap, modern, distinctive.

**Avoid**: 3D character mascot — for a senior IC it reads as junior.

### Motion vocabulary (techniques actually used in 2025–2026 award winners)

- **Framer Motion `whileInView` reveals**, low amplitude (`y: 8 → 0`, opacity 0 → 1, 220–280ms spring `{ stiffness: 120, damping: 18 }`). Used by Emil Kowalski, Samuel Kraft.
- **Lenis smooth scroll** as the baseline for any scroll-linked animation. Used across Olivier Larose, Cyd, Maël Ruffini.
- **GSAP ScrollTrigger pinned sections** for case-study moments — pin the project hero, swap content as user scrolls. Cyd Stumpel, Olivier Larose.
- **Text scramble / split-text reveal on hero**, GSAP SplitText or motion's `staggerChildren`. Sparingly — once on the hero, never on body copy.
- **View Transitions API** for client-side route changes — cleanest 2026 motion upgrade. Rauno uses this.
- **Magnet cursor on primary CTA only**. One magnetic button reads premium; ten reads chaotic.
- **Hover lift on cards**: `translateY(-2px) + shadow` over 180ms ease-out. The default everyone uses for a reason.
- **Section-aware nav** (active section highlights as you scroll) — Brittany Chiang's signature, still works.
- **Spring-physics drawers/dialogs** for any UI surfaces — Vaul/Sonner-style. Emil Kowalski, Paco Coursey.

**Avoid**: parallax tilt cards, infinite text marquees on every section, sparkle cursors, intro loaders > 800ms.

### Type system

The 2026 consensus is narrower than ever — three pairings cover ~80% of best-in-class folios:

| Pairing | Used by | Vibe |
|---|---|---|
| **Inter** + JetBrains/IBM Plex Mono | Brittany, Emil, Linear web | Classic, safe, legible |
| **Geist Sans** + **Geist Mono** | Lee Robinson, Vercel, Paco | "I build for the AI era" signal |
| **Söhne / Aeonik / Inter Display** + a Tiempos-style serif for body | Samuel Kraft (blog), Anthropic | Editorial, designer-engineer |

**Scale (modular):** body 16px / lead 18px / h3 22px / h2 32px / h1 48–72px / display 96–140px. Tighten letter-spacing on display (-0.02 to -0.04em). Generous leading on body (1.6–1.7).

**Pattern:** monospace for *labels* — section numbers, nav, project metadata, timestamps, footer. Sans for everything else. Never use mono for body text.

### Color systems

- **Dark-default is standard** for senior FE folios in 2026 (Lee, Emil, Samuel, Maxime, Brittany).
- **Light-default exceptions** that still read modern: Olivier Larose, Maël Ruffini, Anthropic. Light-default works only if your typography is impeccable — there's nowhere to hide.
- **One accent color, max two.** Vercel = none. Linear = coral + violet. Brittany = teal. Emil = none. The rule: *the work should be the color*.
- **Recommended palette options for this portfolio:**
  - **A (safe-senior):** bg `oklch(14% 0.01 250)`, fg `oklch(95% 0.01 250)`, dim `oklch(60% 0.01 250)`, accent `oklch(72% 0.13 80)` (warm amber).
  - **B (Anthropic-inspired warm):** bg `oklch(96% 0.02 80)` (cream), fg `oklch(20% 0.02 50)`, accent `oklch(55% 0.18 35)` (brick).
  - **C (Vercel-clean):** bg `#000`, fg `#fafafa`, dim `#888`, accent `#fff` (no chromatic accent — underline + weight do the work).
- **Gradient style:** if you use one, make it a single soft radial glow behind the name (350–500px, 12% alpha, blurred), not a banded conic gradient. The conic-gradient hero is the 2023 cliché.
- **Add 1–3% film grain via SVG noise overlay** on dark backgrounds — kills banding, reads premium.

### Bio / copy voice for a senior frontend engineer

The pattern across senior folios is **first-person, plainspoken, specific**. No buzzwords. No "passionate". State what you build, who for, and one signal of taste.

**Headline templates working in 2026:**
- *"Senior frontend engineer. I build $SPECIFIC_THING for $SPECIFIC_CONTEXT."* (Brittany model)
- *"$Name. I'm a $ROLE at $COMPANY."* (Lee model — works only if $COMPANY is recognizable)
- *"Designing and building $DOMAIN at $COMPANY."* (Emil model)
- *"$Name is a $ROLE working with $CLIENT_LIST."* (Rauno model — third-person, lets clients do the lifting)

**Bio openings to copy the cadence of:**
- Brittany: *"I'm a frontend engineer with an expertise in building accessible, pixel-perfect user interfaces that blend thoughtful design with robust engineering."*
- Emil: *"I work on the Web team at Linear. I like to build things for designers and developers."*
- Samuel: *"I'm a Design Engineer at Raycast. I obsess over fast and human products."*
- Lee: *"I'm a developer and writer."*

### IA / section ordering

The pattern in best-in-class senior folios:
1. **Hero** (name + 1-line role + 1-line value).
2. **Selected work** (3–6 projects, not 12). Include role, year, stack tags.
3. **Writing** (only if you actually write).
4. **Now / About** (short, scannable — *omit a heavy About; biography lives in the hero*).
5. **Contact** (email-as-copyable, plus 2–3 socials max).

Notably **omit**: Skills bar/percentage, Education, Hobbies, "Tools I use" iconography grid, testimonials. These read junior in 2026.

---

## 3. Anti-patterns (do not do)

- **Sparkle / particle cursor trails.** Done in 2018, every junior folio has it.
- **Intro loaders longer than ~600ms** with a percentage counter. Time-tax on the visitor.
- **`?_developer` / `~/projects` terminal-prompt headlines** unless you actually work on terminal tools — clichéd hacker cosplay.
- **Conic-gradient hero blob.** 2023 saturation point.
- **Text-shuffle hover on every link.** Fine on the hero, abrasive sitewide.
- **Skills bars with percentages** ("React 95%, CSS 87%"). Never read as anything but junior.
- **Tools/tech icon grid** (the wall of colored logos). Tech tags inline on each project read senior; the grid reads bootcamp.
- **Generic "passionate developer who loves coding" bios.** Replace with specifics.
- **Magnetic cursor applied to >2 elements.** Overplayed in 2024–2025.
- **Tilted/parallax 3D card on hover.** The shaderless 2022 default; everyone outgrew it.
- **Three.js hero scene "because Three.js"** with no narrative payoff.
- **Marquee strips on every section** (clients, tech, "I love coffee"). One marquee max, only with narrative purpose.
- **Floating chatbot avatar** unless you're shipping an AI product.
- **Long auto-playing reel on the hero.** Battery drain + accessibility hit.

---

## 4. Design language for this portfolio (locked in)

After triangulating across the references above, the AI-2026 direction for this site is:

- **Aesthetic template:** quiet/restrained Lee Robinson / Emil Kowalski / Paco Coursey lane. UK-senior-coded.
- **Type:** Geist Sans + Geist Mono labels (or Inter if Geist install is heavy). Modular scale 16/18/22/32/48/72.
- **Color:** dark-default. Single warm accent (retain existing `--color-brand-*` red, optionally re-tune toward warm amber later). Keep existing oklch token system; do not churn the palette.
- **Motion vocabulary:**
  - Framer Motion `whileInView` reveals (`y: 8 → 0`, 220–280ms spring).
  - One scroll-progress bar at the top.
  - Hero role rotator (max 3 strings, slow cycle, paused on hover).
  - Hover-lift on cards (`translateY(-4px)` + shadow over 180ms).
  - All motion gated by `useReducedMotion()` from framer-motion.
  - **No** GSAP, Three.js, Lenis, or paid motion libraries.
- **Density rules:** body line-length max ~70 ch; section vertical rhythm `py-16 md:py-24`; never put more than 6 items in any list above the fold.

---

## 5. Sources

- [Brittany Chiang](https://brittanychiang.com)
- [Lee Robinson](https://leerob.com)
- [Rauno Freiberg](https://rauno.me)
- [Paco Coursey](https://paco.me)
- [Emil Kowalski](https://emilkowal.ski)
- [Josh W. Comeau](https://joshwcomeau.com)
- [Cassidy Williams](https://cassidoo.co)
- [Olivier Larose](https://olivierlarose.com)
- [Cyd Stumpel](https://cydstumpel.nl)
- [Samuel Kraft](https://samuelkraft.com)
- [Maxime Heckel](https://maximeheckel.com)
- [Delba Oliveira](https://delba.dev)
- [Lazar Nikolov](https://nikolovlazar.com)
- [Tim Holman](https://tholman.com)
- [Maël Ruffini](https://maelruffini.com)
- [Linear](https://linear.app)
- [Vercel](https://vercel.com)
- [Anthropic](https://anthropic.com)
- [Awwwards — Best Portfolios](https://www.awwwards.com/websites/portfolio/)
- [Awwwards — Developer category](https://www.awwwards.com/websites/developer/)
