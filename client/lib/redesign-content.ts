/**
 * Centralized content for the redesigned portfolio home page.
 * Edit copy here, not in components.
 */

export const redesignContent = {
  meta: {
    title: 'Ibrahim Kasoma — Senior Software Engineer',
    description:
      'Senior Software Engineer with 6+ years building production TypeScript across frontend and backend-integrated systems. 80+ apps shipped, 60+ markets, 3.4M+ users on EF Education First’s flagship Next.js platform.',
  },
  nav: {
    brand: 'Ibrahim Kasoma',
    links: [
      { href: '#skills', label: 'Skills' },
      { href: '#work', label: 'Work' },
      { href: '#showcase', label: 'Showcase' },
      { href: '#experience', label: 'Experience' },
      { href: '#contact', label: 'Contact' },
    ],
  },
  hero: {
    eyebrow: 'Senior Software Engineer · TypeScript · React · Node.js',
    name: 'Ibrahim Kasoma.',
    rolePool: [
      'Senior Software Engineer',
      'Frontend Platform Engineer',
      'API-driven Systems',
      'Scalable Delivery',
    ],
    statement:
      'I build and scale production TypeScript across EF Education First, freelance client work, and personal projects — 80+ apps shipped end to end. Currently shipping seven concurrent projects at EF, where the flagship Next.js platform reaches 3.4M+ users in 60+ markets.',
    status: { label: 'Available · Senior frontend roles, UK', dotColor: 'bg-emerald-400' },
    location: 'Stroud, England, UK',
    primaryCta: { label: 'Email me', href: 'mailto:kasomaibrahim@gmail.com' },
    avatarSrc: '/icons/avarta-cutout.webp',
    avatarAlt: 'Ibrahim Kasoma — Senior Software Engineer',
  },
  stats: {
    eyebrow: 'By the numbers',
    items: [
      { value: '6+', suffix: '', label: 'Years building production', sub: 'TypeScript · React · Node' },
      { value: '80+', suffix: '', label: 'Frontend apps shipped', sub: 'Across all roles' },
      { value: '7+', suffix: '', label: 'EF projects in parallel', sub: 'Multi-brand consumer surfaces' },
      { value: '3.4', suffix: 'M+', label: 'MAU on the flagship', sub: 'EF Next.js platform · 60+ markets' },
    ],
  },
  ticker: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Tailwind',
    'Nx',
    'GraphQL',
    'AWS',
    'GCP',
    'GitHub Actions',
    'Storybook',
    'Jest',
    'Cypress',
    'Performance',
    'Accessibility',
  ],
  skills: {
    eyebrow: '01 — Core skills',
    heading: 'What I am fluent in.',
    groups: [
      {
        label: 'Frontend',
        items: [
          'React',
          'Next.js',
          'TypeScript',
          'JavaScript (ES6+)',
          'Gatsby',
          'Redux',
          'React Query',
          'Tailwind CSS',
          'CSS3',
        ],
      },
      {
        label: 'Backend & APIs',
        items: ['Node.js', 'Express', 'REST', 'GraphQL', 'API Integration'],
      },
      {
        label: 'Cloud & Delivery',
        items: ['AWS (S3, CloudFront)', 'GitHub Actions', 'Vercel', 'Docker', 'Release Automation'],
      },
      {
        label: 'Architecture & Tooling',
        items: ['Nx Monorepos', 'Micro-frontends', 'Webpack', 'Vite', 'Storybook', 'Component Libraries'],
      },
      {
        label: 'Testing & Reliability',
        items: ['Jest', 'React Testing Library', 'Cypress', 'Sentry', 'Observability'],
      },
      {
        label: 'Platforms',
        items: ['GCP', 'Storyblok', 'Contentful', 'Sanity', 'Headless CMS'],
      },
    ],
  },
  work: {
    eyebrow: '02 — Selected Work',
    heading: 'Public surfaces I have shipped.',
    items: [
      {
        slug: 'ef-epi',
        year: '2026',
        title: 'EF EPI — English Proficiency Index',
        role: 'Senior Frontend Engineer · Data Visualization',
        summary:
          'EF’s flagship data-viz platform — the English Proficiency Index. A Next.js application serving 57 international markets and 3.4M monthly users. I cut page load times by 60% and improved Core Web Vitals across all three.',
        stack: ['Next.js', 'TypeScript', 'Data Viz', 'Web Vitals'],
        metric: '−60% page load · 3.4M MAU · 57 markets',
        live: 'https://www.ef.com/epi',
      },
      {
        slug: 'ef-homepage',
        year: '2025',
        title: 'EF Homepage — ef.com',
        role: 'Senior Frontend Engineer · Brand surface',
        summary:
          'EF’s global homepage — Language. Education. Travel. Helped scale a shared platform behind the consumer brand surfaces, with daily multi-region releases on a CI/CD platform deploying 17 production frontend apps.',
        stack: ['Next.js', 'TypeScript', 'CMS', 'Edge Cache'],
        metric: '60+ markets · daily releases',
        live: 'https://www.ef.com/homepage',
      },
      {
        slug: 'ef-pg',
        year: '2024',
        title: 'EF Programs — All EF programs',
        role: 'Frontend Architecture · Microfrontends',
        summary:
          'The global catalog of EF’s language and travel programs. Architected the Nx monorepo that consolidated 20+ microfrontends across 8 product teams — eliminated 15,000+ lines of duplicate code and unified releases behind a single shared pipeline.',
        stack: ['Next.js', 'Nx', 'TypeScript', 'Microfrontends'],
        metric: '20+ MFEs · −15k LOC · 8 teams',
        live: 'https://www.ef.com/pg',
      },
    ],
  },
  showcase: {
    eyebrow: '03 — Showcase',
    heading: 'Things I built and shipped, outside of EF.',
    body: 'Side projects and freelance builds with public live deploys. Each one was shipped end to end — design, build, deploy, iterate.',
    items: [
      {
        slug: 'comp-lib',
        kind: 'Design Systems · Storybook',
        title: 'comp-lib — Component library lab',
        summary:
          'A personal design-system playground in Storybook — primitives, motion, theming, and accessibility patterns. The kind of internal lab that keeps a senior frontend engineer sharp on the basics.',
        stack: ['React', 'TypeScript', 'Storybook', 'Tailwind'],
        live: 'https://comp-lib-gamma.vercel.app',
        repo: 'https://github.com/akibrahimug/comp-lib',
      },
      {
        slug: 'devops-insights',
        kind: 'DevOps · Dashboards',
        title: 'DevOps Insights — Real-time dashboard',
        summary:
          'Real-time monitoring dashboard for DevOps metrics across global regions. Charts, regional breakdowns, and signal-over-noise visual hierarchy.',
        stack: ['Next.js', 'TypeScript', 'Charting', 'Tailwind'],
        live: 'https://devops-insights-ebon.vercel.app',
        repo: 'https://github.com/akibrahimug/devops-insights',
      },
      {
        slug: 'learner',
        kind: 'AI · Education',
        title: 'Learner — Real-time AI teaching platform',
        summary:
          'Real-time AI teaching platform with character-based companions and live learning sessions. An AI-native take on the tutor + classroom format.',
        stack: ['Next.js', 'TypeScript', 'AI', 'Realtime'],
        live: 'https://learner-phi.vercel.app',
        repo: 'https://github.com/akibrahimug/learner',
      },
      {
        slug: 'puur-safaris',
        kind: 'Travel · CMS',
        title: 'Puur Uganda Reizen — Tailor-made safari trips',
        summary:
          'Discover Africa with Puur Uganda Reizen — personal, tailor-made safari trips to Uganda and beyond. Editorial photography and a CMS-driven trip catalog built for storytelling.',
        stack: ['Next.js', 'TypeScript', 'Tailwind', 'CMS'],
        live: 'https://puur-safaris.vercel.app',
        repo: 'https://github.com/akibrahimug/puur-safaris',
      },
      {
        slug: 'oliotya',
        kind: 'Travel · Marketing',
        title: 'Oliotya Uganda Safaris — Discover Uganda',
        summary:
          'Experience the Pearl of Africa — wildlife, mountains, gorilla trekking. A marketing site with rich content blocks, image galleries, and conversion-focused booking pathways.',
        stack: ['Next.js', 'Tailwind', 'Image-led layout'],
        live: 'https://fox-adventures.vercel.app',
        repo: 'https://github.com/akibrahimug/Oliotya-Uganda-Safaris',
      },
      {
        slug: 'igcfashion',
        kind: 'Fashion · Catalog',
        title: 'IGCFashion — Multi-brand fashion catalog',
        summary:
          'A fashion catalog with multi-brand product grids, category navigation, and an editorial layout — image-led product cards on a JavaScript stack.',
        stack: ['JavaScript', 'Tailwind', 'Image-led'],
        live: 'https://igc-mock-app-2024.vercel.app',
        repo: 'https://github.com/akibrahimug/igc-site',
      },
    ],
  },
  process: {
    eyebrow: '04 — How I work',
    heading: 'Discover · Architect · Ship · Iterate.',
    body: 'A pragmatic loop. Each step ends with something that ships. Click a card to see how I think about it.',
    steps: [
      {
        n: '01',
        title: 'Discover',
        body: 'Sit with the problem before the keyboard. Read the code. Talk to users and to the people on either side of you.',
        details: [
          'Read the existing code top to bottom before pitching a change. Most “rewrites” are unread codebases.',
          'Talk to two layers — the people who will use it, and the people who will maintain it after I am gone.',
          'Define success in one sentence. If I cannot, I do not yet understand the problem.',
          'Look for the deletion in the brief — what existing thing should this replace, not just add?',
        ],
      },
      {
        n: '02',
        title: 'Architect',
        body: 'Pick a path that survives a year of edits. Boring TypeScript, boring Postgres, boring component library, boring CI.',
        details: [
          'Write a one-page brief before the first PR. Forces tradeoffs to be visible to everyone, including me.',
          'Sketch the data flow on paper before code. Most production bugs hide in the data flow, not the syntax.',
          'Name every piece. Names age slower than implementations.',
          'Choose boring on the load-bearing parts; spend the novelty budget on the leaf nodes.',
        ],
      },
      {
        n: '03',
        title: 'Ship',
        body: 'Small PRs, real feedback loops, real tests. Performance budgets and accessibility on day one — never bolted on.',
        details: [
          'Small PRs (under ~200 LOC where possible). Reviews stay sharp; bugs get caught while context is still warm.',
          'Performance budget and accessibility checks land in the same PR as the feature, not as cleanup later.',
          'Feature-flag anything user-visible. Roll out by market, by cohort, by 1% — keep the blast radius small.',
          'Tests that match the contract, not the implementation. Refactor freely without breaking the suite.',
        ],
      },
      {
        n: '04',
        title: 'Iterate',
        body: 'Watch the metrics that matter. Roll back fast. Pay down debt that slows the next person.',
        details: [
          'Watch Core Web Vitals, error rate, real user latency — not just CI green.',
          'Roll back fast. The ego cost is one Slack message; the user cost compounds.',
          'Pay down debt that slows the next person, not whatever annoyed you yesterday.',
          'Leave a trail — ADRs for non-obvious calls, runbooks for the on-call, postmortems for anything that hurt.',
        ],
      },
    ],
  },
  experience: {
    eyebrow: '05 — Experience',
    heading: 'Where I have worked, what I shipped there.',
    roles: [
      {
        company: 'EF Education First',
        place: 'London, UK · Hybrid',
        title: 'Senior Frontend Engineer',
        period: 'Mar 2023 — Present',
        href: 'https://www.ef.com',
        bullets: [
          'Shipping seven concurrent EF projects across 80+ frontend apps and 60+ markets — including the EPI, Homepage, and Programs surfaces.',
          'Built and owned a shared CI/CD platform — pipeline 45 → 15 minutes, daily multi-region releases.',
          'Cut page load times by 60% on a Next.js platform serving 57 international markets and 3.4M monthly users — improved Core Web Vitals across all three metrics.',
          'Architected an Nx monorepo consolidating 20+ microfrontends across 8 product teams — eliminated 15,000+ lines of duplicate code.',
          'Lifted test coverage from ~30% to 85% with Jest + React Testing Library — reduced production incidents by ~40%.',
          'Mentored engineers through code reviews, shared standards, and architecture discussions.',
        ],
      },
      {
        company: 'San Damiano Ltd',
        place: 'Surrey, UK · Hybrid',
        title: 'Frontend Engineer (Full-Stack JavaScript)',
        period: 'Jun 2022 — Feb 2023',
        bullets: [
          'Built internal tooling with React, Node.js, and Express — increased employee productivity by ~40%.',
          'Automated manual workflows end to end — 4 hours → under 5 minutes.',
          'Designed and implemented REST APIs powering role-based frontend experiences for multiple internal user types.',
        ],
      },
      {
        company: 'Freelance Web Application Developer',
        place: 'London, UK',
        title: 'React · JavaScript · Node.js',
        period: 'Feb 2020 — Nov 2022',
        bullets: [
          'Delivered end-to-end web applications for multiple clients — managed requirements through production deployment.',
          'Integrated third-party REST APIs and shipped production-ready releases with responsive, accessible frontends.',
          'Translated business requirements into scalable technical solutions, balancing maintainability, usability, and delivery speed.',
        ],
      },
    ],
    education: [
      {
        school: 'Treehouse',
        course: 'Full-Stack JavaScript (React, Node.js)',
        period: '2021 — 2022',
      },
      {
        school: 'Zero To Mastery Academy',
        course: 'Algorithms & Data Structures (Self-Directed)',
        period: '2021 — 2022',
      },
    ],
  },
  tech: {
    eyebrow: '06 — Tech I reach for',
    heading: 'Day-to-day tools.',
    body: 'A live, searchable view of the stack I lean on across product engineering, platform work, and personal projects.',
  },
  currently: {
    eyebrow: '07 — Currently',
    heading: 'What I am up to right now.',
    asOf: 'Updated April 2026',
    items: [
      {
        k: 'Shipping',
        v: 'Seven concurrent EF projects across 60+ markets — including the EPI data-viz, the homepage, and the programs catalog.',
      },
      {
        k: 'Building',
        v: 'A platform CI/CD that ships 17 production frontend apps daily — and the Nx monorepo it sits on top of.',
      },
      {
        k: 'Reading & writing',
        v: 'Notes on platform engineering, design systems at scale, and the quiet revolution in AI-era tooling.',
      },
      {
        k: 'Open to',
        v: 'Senior frontend / platform roles in the UK. Strong product teams, real performance budgets, modern stack.',
      },
    ],
  },
  about: {
    eyebrow: '08 — About',
    heading: 'I care about craft, performance, and pragmatic architecture.',
    paragraphs: [
      'Senior Software Engineer with six years on production frontend at scale — multi-brand monorepos, edge-cached marketing surfaces, dashboards that outlive their authors. The throughline across EF Education First, freelance client work, and personal side projects: 80+ apps shipped end to end. At EF specifically, I work across seven concurrent projects, where the flagship Next.js platform reaches 3.4M+ monthly users in 60+ markets.',
      'What I care about is the boring middle — the platform work that lets a small team ship at the pace of a much bigger one. Shared CI/CD pipelines, design tokens, observability, performance budgets that hold under real traffic. The flashy stuff (motion, micro-interactions, AI-era tooling) is fun, but the real leverage comes from making it cheap to ship the next thing safely.',
      'I write TypeScript and Node by default. I read code before I write it. I prefer boring choices that survive a year of edits, small PRs that compound, and metrics that move. Based in Stroud — open to senior frontend roles in the UK where the bar is high and the team is small enough to feel.',
    ],
    facts: [
      { k: 'Years building', v: '6+' },
      { k: 'Apps shipped', v: '80+' },
      { k: 'Based in', v: 'Stroud, UK' },
      { k: 'Currently', v: 'EF Education First' },
    ],
  },
  contact: {
    eyebrow: '09 — Contact',
    heading: 'Let’s talk.',
    body: 'Fastest way to reach me is email — I read everything and reply within a day. The form is fine too if you prefer.',
    email: 'kasomaibrahim@gmail.com',
    socials: [
      { key: 'github', label: 'GitHub', href: 'https://github.com/akibrahimug' },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/kasoma-ibrahim-89a732168/',
      },
      { key: 'twitter', label: 'X / Twitter', href: 'https://twitter.com/Akibrahimug' },
    ],
  },
  footer: {
    line: '© 2026 Ibrahim Kasoma. Built with Next.js, Tailwind, and Framer Motion.',
    repo: 'https://github.com/akibrahimug/portfolio',
  },
} as const

export type RedesignContent = typeof redesignContent
