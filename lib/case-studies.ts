/**
 * Case studies — the deep pages at /work/[slug] and the home page's case-study index.
 *
 * Every claim is sourced (the `// src:` notes): the CV (public/Ibrahim_Kasoma_CV.pdf), the
 * site's own content, or the project's public README. Anything that could not be sourced is
 * an `openQuestions` entry for Ibrahim to answer — those are never rendered.
 */
import { redesignContent } from './redesign-content'

/** The one figure that proves the case, with the sentence it belongs to. */
export type LeadFigure = { value: string; sentence: string }

export type CaseStudy = {
  slug: string
  /** Short title for the index and <title>. */
  title: string
  /** One-line promise, shown under the title. */
  lede: string
  context: string
  role: string
  period: string
  origin: 'ef' | 'independent'
  image: string
  imageAlt: string
  live?: string
  repo?: string
  stack: string[]
  /** Omitted when the project has no measured figure (Learner) — never filled with a label. */
  lead?: LeadFigure
  problem: string
  approach: string[]
  outcome: string
  /** Before/after figures from `redesignContent.impact`, by key, rendered as a chart. */
  impactKeys?: string[]
  /** Unsourced details for Ibrahim to confirm. Never rendered. */
  openQuestions: string[]
}

const live = (slug: string) =>
  [...redesignContent.work.items, ...redesignContent.showcase.items].find((p) => p.slug === slug)?.live

export const caseStudies: CaseStudy[] = [
  {
    slug: 'ef-epi',
    title: 'EF EPI',
    lede: 'Making EF’s flagship data-visualisation site fast for every market it serves.',
    context:
      'The EF English Proficiency Index is the world’s largest ranking of countries and regions by English skills: a Next.js application serving 57 international markets.', // src: site work item + live page headline
    role: 'Senior Frontend Engineer · EF Education First',
    period: '2023 – present', // src: CV (EF role dates)
    origin: 'ef',
    image: '/projects/ef-epi.webp',
    imageAlt: 'The EF EPI homepage: “The world’s largest ranking of countries and regions by English skills”.',
    live: live('ef-epi'),
    stack: ['Next.js', 'TypeScript', 'Data visualisation', 'Core Web Vitals'],
    lead: { value: '−60%', sentence: 'page load time on a platform read by 3.4M people a month in 57 markets.' }, // src: CV / README figures above
    problem:
      'EF’s flagship data-visualisation site had grown slow. For a page whose job is to be read, shared and cited across 57 markets, load time was the product.',
    approach: [
      'Diagnosed the rendering and loading bottlenecks on the Next.js platform before changing anything.', // src: CV
      'Re-architected the front end and its data layer around what those measurements showed.', // src: site Impact caption
      'Tracked load time as a business metric across every market, not as a one-off audit.', // src: CV summary
    ],
    outcome:
      'Page load times fell by 60%, time to interactive improved by three seconds, and all three Core Web Vitals moved into better ranges.', // src: CV
    impactKeys: ['page-load'],
    openQuestions: [
      'Which specific techniques drove the 60%? (e.g. rendering strategy, code-splitting, data fetching, image or font loading)',
      'Is there a before/after Lighthouse or CrUX figure you can share for the three Core Web Vitals?',
    ],
  },
  {
    slug: 'ef-pg',
    title: 'EF Programs',
    lede: 'Bringing eight product teams onto one monorepo and one release pipeline.',
    context:
      'The global catalogue of EF’s language and travel programmes, built and shipped by eight product teams.', // src: site work item
    role: 'Frontend architecture · EF Education First',
    period: '2023 – present',
    origin: 'ef',
    image: '/projects/ef-pg.webp',
    imageAlt: 'The EF programs page: “All EF programs” with a “Find a program” search.',
    live: live('ef-pg'),
    stack: ['Next.js', 'Nx', 'TypeScript', 'Microfrontends', 'Claude Code'],
    lead: { value: '20+', sentence: 'microfrontends consolidated into one Nx monorepo, retiring 15,000+ lines of duplicated code.' }, // src: CV / README figures above
    problem:
      'Twenty-plus microfrontends had drifted apart across eight teams: duplicated code, duplicated components and separate releases. Every team paid for the fragmentation.',
    approach: [
      'Architected the Nx monorepo the eight product teams now ship from, behind a single shared build and release pipeline.', // src: CV
      'Established the shared component library the frontend estate standardises on, ending duplicate component work across teams.', // src: CV
      'Wrote the CLAUDE.md, AGENTS.md and Skills definitions that give coding agents the monorepo’s architecture and conventions, so agent-written code follows the same patterns as everyone else’s.', // src: CV
    ],
    outcome:
      'More than 15,000 lines of duplicated code were retired, and twenty-plus microfrontends now release through one pipeline.', // src: CV
    openQuestions: [
      'How long did the consolidation take, and was it done incrementally (strangler) or as a cut-over?',
      'Any measurable change in build or release time for the teams after the move?',
    ],
  },
  {
    slug: 'ef-homepage',
    title: 'The platform behind ef.com',
    lede: 'Turning slow, risky releases into a daily routine across 60+ markets.',
    context:
      'EF’s global homepage and the consumer brand surfaces around it, released daily to 60+ markets from a shared delivery platform.', // src: site work item + CV
    role: 'Senior Frontend Engineer · EF Education First',
    period: '2023 – present',
    origin: 'ef',
    image: '/projects/ef-homepage.webp',
    imageAlt: 'The ef.com homepage: “hello!” above a row of travel and study photographs.',
    live: live('ef-homepage'),
    stack: ['Next.js', 'TypeScript', 'GitHub Actions', 'Jest', 'React Testing Library'],
    lead: { value: '45 → 15', sentence: 'minutes per CI run for the 17 frontends behind ef.com, with coverage up from ~30% to 85%.' }, // src: CV / README figures above
    problem:
      'Seventeen production frontends shared one CI/CD pipeline that took 45 minutes, and test coverage sat around 30%. Slow, risky releases across 60+ markets.',
    approach: [
      'Took ownership of the shared CI/CD platform behind all seventeen frontends.', // src: CV
      'Parallelised builds and removed repeated package installs, bringing a pipeline run from 45 minutes to 15.', // src: CV
      'Introduced structured testing with Jest and React Testing Library and made it part of every pull request.', // src: CV + site Impact caption
      'Negotiated API contracts with backend teams for the multi-region applications, and mentored engineers through review.', // src: CV
    ],
    outcome:
      'Daily multi-region releases became routine: pipelines run in a third of the time, coverage rose to 85%, and production incidents fell by about 40%.', // src: CV
    impactKeys: ['ci', 'coverage', 'incidents'],
    openQuestions: [
      'Is it fair to present the CI/CD and testing work under the ef.com homepage, or should this case study be titled purely as the delivery platform?',
    ],
  },
  {
    slug: 'learner',
    title: 'Learner',
    lede: 'Real-time voice AI tutors you can talk to, built end to end.',
    context:
      'An independent product: users create voice “companions” (AI tutors) for any subject and run live teaching sessions with them.', // src: repo README
    role: 'Design, build and deploy · independent',
    period: '2025', // src: repo created 2025-06
    origin: 'independent',
    image: '/projects/learner.webp',
    imageAlt: 'Learner’s dashboard: popular companions such as a Next.js tutor and a Swahili tutor, and recent sessions.',
    live: live('learner'),
    repo: 'https://github.com/akibrahimug/learner',
    stack: ['Next.js 15', 'React 19', 'Vapi', 'Clerk', 'Supabase', 'Tailwind 4'],
    problem:
      'Tutoring is a conversation, not a chat box. The product had to hold a real-time voice session together across speech recognition, a language model and speech synthesis, and still feel like a normal web app.',
    approach: [
      'Built on Next.js 15’s App Router with Server Components and Server Actions, on React 19.', // src: README
      'Real-time voice through Vapi over WebRTC: Deepgram Nova-3 for speech-to-text, GPT-4 for the conversation, ElevenLabs for the voice.', // src: README
      'Clerk for authentication and subscriptions (free users get three companions, Pro is unlimited), Supabase Postgres for companions, session history and bookmarks.', // src: README
      'Designed for failure: production error handling and graceful degradation when a voice service drops.', // src: README
    ],
    outcome:
      'A live product: anyone can build a companion for a subject, search a shared library, hold a voice lesson with a transcript, and pick up their history later.', // src: README features
    openQuestions: ['Any usage numbers (users, sessions, minutes of voice) you are happy to publish?'],
  },
  {
    slug: 'comp-lib',
    title: 'comp-lib',
    lede: 'A design system built to be operated by coding agents as much as by people.',
    context:
      'A Tailwind-first, variant-driven, polymorphic React component library with a runtime-themeable design system and an interactive Storybook.', // src: README
    role: 'Design and build · independent',
    period: '2025 – 2026', // src: repo created 2025-11, pushed 2026
    origin: 'independent',
    image: '/projects/comp-lib.webp',
    imageAlt: 'comp-lib’s Storybook welcome page: “Components with taste.” with live themed components.',
    live: live('comp-lib'),
    repo: 'https://github.com/akibrahimug/comp-lib',
    stack: ['React', 'TypeScript', 'Tailwind', 'Storybook', 'tailwind-merge'],
    lead: { value: '40+', sentence: 'accessible components and primitives, with 24 section blocks and four runtime themes.' }, // src: CV / README figures above
    problem:
      'Most component libraries are written for people reading docs. Coding agents now write much of the UI, and they need the API surface as data, not prose.',
    approach: [
      'A `tv()` variant engine for composable, type-safe variants, with polymorphic `as` and conflict-aware `tw` props.', // src: README
      'Four runtime themes driven by CSS-variable tokens: re-skin the whole system by setting `data-theme` on a root element.', // src: README
      'Agent-operable by design: an `llms.txt` index, a `registry.json` of every component’s variants and props generated from source, an `AGENTS.md` contract, and a static `__meta` on each component for runtime introspection.', // src: README
      'SSR-safe hooks, tree-shakable named exports and WCAG 2.1 AA keyboard and focus behaviour throughout.', // src: README
    ],
    outcome:
      'A full system rather than a demo: forty-plus components and primitives, a 24-block section tier and copy-ready page templates, documented for both humans and agents.', // src: README
    openQuestions: [
      'The Storybook welcome page says “28 components” while the README says “40+ components and primitives”. Which count should the site use?',
    ],
  },
]

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug)
export const caseStudySlugs = new Set(caseStudies.map((c) => c.slug))

/** Independent work without its own case study, for the "More work" list. */
export const moreWork = redesignContent.showcase.items.filter((p) => !caseStudySlugs.has(p.slug))
