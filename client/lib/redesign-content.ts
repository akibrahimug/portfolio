/**
 * Centralized content for the redesigned portfolio home page.
 * Edit copy here, not in components.
 *
 * Numbers and language sourced from Ibrahim's CV (Apr 2026):
 * Senior Software Engineer · 6+ years · Stroud, UK
 * Currently at EF Education First — Mar 2023 → Present.
 */

export const redesignContent = {
  meta: {
    title: 'Ibrahim Kasoma — Senior Software Engineer',
    description:
      'Senior Software Engineer with 6+ years building production TypeScript across frontend and backend-integrated systems. Currently scaling 17 frontend apps across 60+ markets at EF Education First.',
  },
  nav: {
    brand: 'Ibrahim Kasoma',
    links: [
      { href: '#work', label: 'Work' },
      { href: '#showcase', label: 'Showcase' },
      { href: '#experience', label: 'Experience' },
      { href: '#process', label: 'Process' },
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
      'I build and scale production TypeScript applications across frontend and backend-integrated systems. Currently shipping at EF Education First — 17 frontend apps across 60+ markets, 3.4M monthly users.',
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
      { value: '17', suffix: '', label: 'Frontend apps shipped', sub: 'EF · 60+ markets' },
      { value: '3.4', suffix: 'M', label: 'Monthly active users', sub: 'Across 57 markets' },
      { value: '60', suffix: '%', label: 'Page load reduction', sub: 'Core Web Vitals · all 3' },
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
  work: {
    eyebrow: '01 — Selected Work',
    heading: 'Things I built that moved real numbers.',
    items: [
      {
        slug: 'ef-cicd',
        year: '2024',
        title: 'EF — Shared CI/CD platform',
        role: 'Senior Frontend Engineer · Platform',
        summary:
          'Owned a shared CI/CD pipeline deploying 17 production frontend apps across 60+ markets. Cut pipeline duration from 45 minutes to 15 minutes — enabled daily multi-region releases.',
        stack: ['GitHub Actions', 'Nx', 'Docker', 'Vercel'],
        metric: '45 → 15 min · 60+ markets',
        href: 'https://github.com/akibrahimug',
      },
      {
        slug: 'ef-perf',
        year: '2024',
        title: 'EF — Next.js performance program',
        role: 'Senior Frontend Engineer',
        summary:
          'Diagnosed rendering and loading bottlenecks on a Next.js platform serving 57 international markets and 3.4M monthly users. Cut page load times by 60% and improved all three Core Web Vitals.',
        stack: ['Next.js', 'TypeScript', 'Web Vitals', 'Edge Cache'],
        metric: '−60% page load · 3.4M MAU',
        href: 'https://github.com/akibrahimug',
      },
      {
        slug: 'ef-monorepo',
        year: '2023',
        title: 'EF — Nx monorepo consolidation',
        role: 'Frontend Architecture',
        summary:
          'Architected an Nx monorepo consolidating 20+ microfrontends across 8 product teams. Eliminated 15,000+ lines of duplicate code and unified releases behind a single shared pipeline.',
        stack: ['Nx', 'Microfrontends', 'TypeScript', 'CI/CD'],
        metric: '20+ MFEs · −15k LOC',
        href: 'https://github.com/akibrahimug',
      },
      {
        slug: 'sandamiano-tools',
        year: '2022',
        title: 'San Damiano — Internal tooling',
        role: 'Frontend Engineer (Full-Stack JS)',
        summary:
          'Built internal tooling with React, Node, and Express. Automated manual workflows from 4 hours down to under 5 minutes. Lifted employee productivity by ~40%.',
        stack: ['React', 'Node.js', 'Express', 'REST APIs'],
        metric: '4 hr → 5 min · +40% productivity',
        href: 'https://github.com/akibrahimug',
      },
      {
        slug: 'portfolio',
        year: '2026',
        title: 'This portfolio',
        role: 'Design + Build',
        summary:
          'Designed and built end to end. Pages Router, Tailwind v4, Framer Motion, MongoDB-backed admin, GCS uploads, Clerk auth. Aimed at the AI-2026 senior-IC bar.',
        stack: ['Next.js', 'TypeScript', 'Tailwind v4', 'Framer Motion', 'MongoDB'],
        metric: 'Open source',
        href: 'https://github.com/akibrahimug/portfolio',
      },
    ],
  },
  showcase: {
    eyebrow: '02 — Showcase',
    heading: 'Things I built and shipped.',
    body: 'A curated set of public projects with live deploys and source. Each one was shipped end to end — design, build, deploy, iterate.',
    items: [
      {
        slug: 'gov-ug',
        kind: 'Civic',
        title: 'GOV.UG — Government of Uganda',
        summary:
          'The official online home of the Government of Uganda. Services, news, guidance and publications across every ministry, agency, and public body — designed for clarity and trust at national scale.',
        stack: ['Next.js', 'TypeScript', 'Tailwind', 'Headless CMS'],
        live: 'https://ug-gov-frontend.vercel.app',
        repo: 'https://github.com/akibrahimug/ugGov',
      },
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
          'Discover Africa with Puur Uganda Reizen — personal, tailor-made safari trips to Uganda and beyond. Small groups, local experts, editorial photography, and a CMS-driven trip catalog built for storytelling.',
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
    ],
  },
  process: {
    eyebrow: '03 — How I work',
    heading: 'Discover · Architect · Ship · Iterate.',
    body: 'A pragmatic loop. Each step ends with something that ships.',
    steps: [
      {
        n: '01',
        title: 'Discover',
        body: 'Sit with the problem before the keyboard. Read the code. Talk to users and to the people on either side of you. Understand what success actually looks like.',
      },
      {
        n: '02',
        title: 'Architect',
        body: 'Pick a path that survives a year of edits. Write a one-page brief, sketch the data flow, name the pieces. Boring choices when boring beats clever.',
      },
      {
        n: '03',
        title: 'Ship',
        body: 'Small PRs, real feedback loops, real tests. Performance budgets and accessibility on day one — never bolted on. Release behind a flag if there is any doubt.',
      },
      {
        n: '04',
        title: 'Iterate',
        body: 'Watch the metrics that matter. Roll back fast. Pay down debt that slows the next person. Keep what works, retire what does not, leave the place tidier than you found it.',
      },
    ],
  },
  experience: {
    eyebrow: '04 — Experience',
    heading: 'Where I have worked, what I shipped there.',
    roles: [
      {
        company: 'EF Education First',
        place: 'London, UK · Hybrid',
        title: 'Senior Frontend Engineer',
        period: 'Mar 2023 — Present',
        href: 'https://www.ef.com',
        bullets: [
          'Built and owned a shared CI/CD platform deploying 17 production frontend applications across 60+ markets — pipeline 45 → 15 minutes, daily multi-region releases.',
          'Cut page load times by 60% on a Next.js platform serving 57 international markets and 3.4M monthly users — improved Core Web Vitals across all three metrics.',
          'Architected an Nx monorepo consolidating 20+ microfrontends across 8 product teams — eliminated 15,000+ lines of duplicate code.',
          'Lifted test coverage from ~30% to 85% with Jest + React Testing Library — reduced production incidents by ~40%.',
          'Delivered API-driven features end to end, partnering with backend, product, and design across high-traffic user journeys.',
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
  skills: {
    eyebrow: '05 — Core skills',
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
        v: 'Next.js perf and Nx monorepo platform work at EF Education First — 17 apps · 60+ markets · daily multi-region releases.',
      },
      {
        k: 'Building',
        v: 'This portfolio. Tailwind v4 + Framer Motion + MongoDB-backed admin. Aiming for the AI-2026 senior-IC bar.',
      },
      {
        k: 'Reading',
        v: 'Writing about product engineering, design systems at scale, and the quiet revolution in AI-era tooling.',
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
      'Senior Software Engineer with 6+ years shipping production TypeScript applications across frontend and backend-integrated systems. Strong track record delivering API-driven features end to end, improving performance and reliability, and contributing to architecture, CI/CD, and engineering standards in fast-moving product environments.',
      'Frontend engineer with strong Node.js and API integration experience — comfortable working across the stack to ship product features, improve developer workflows, and support scalable delivery in growing teams.',
      'Currently shipping at EF Education First. Based in Stroud, England — open to senior frontend roles in the UK.',
    ],
    facts: [
      { k: 'Years building', v: '6+' },
      { k: 'Based in', v: 'Stroud, UK' },
      { k: 'Currently', v: 'EF Education First' },
      { k: 'Focus', v: 'Performance · DX · Platform' },
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
