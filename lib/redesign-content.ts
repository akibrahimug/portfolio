/**
 * Centralized content for the redesigned portfolio home page.
 * Edit copy here, not in components.
 */

export const redesignContent = {
  meta: {
    title: 'Ibrahim Kasoma · Senior Frontend Engineer',
    description:
      'Senior Frontend Engineer with 6+ years building production TypeScript across frontend and backend-integrated systems. 80+ apps shipped, 60+ markets, 3.4M+ users on EF Education First’s flagship Next.js platform.',
  },
  nav: {
    brand: 'Ibrahim Kasoma',
    links: [
      { href: '#demo', label: 'Demo' },
      { href: '#work', label: 'Work' },
      { href: '#showcase', label: 'Showcase' },
      { href: '#experience', label: 'Experience' },
      { href: '#contact', label: 'Contact' },
    ],
  },
  cv: { label: 'Download CV', href: '/Ibrahim_Kasoma_CV.pdf' },
  hero: {
    availability: 'Open to senior frontend roles · Stroud, UK',
    /** h1 — names the category. `{ em }` segments render as the accent italic. */
    headline: ['Senior frontend engineer building', { em: 'AI-native' }, 'interfaces.'] as const,
    statement:
      'Six years of production TypeScript and React, 80+ apps shipped. At EF Education First I ship across a Next.js platform used by 3.4M people a month in 60+ markets.',
    location: 'Stroud, Gloucestershire, UK',
    primaryCta: { label: 'Email me', href: 'mailto:kasomaibrahim@gmail.com' },
    secondaryCta: { label: 'Try the live demo', href: '#demo' },
    stats: [
      { value: '6+', label: 'Years in production' },
      { value: '80+', label: 'Apps shipped' },
      { value: '3.4M', label: 'Monthly users' },
    ],
    avatarSrc: '/icons/avarta-cutout.webp',
    avatarWidth: 1221,
    avatarHeight: 1472,
    avatarAlt: 'Ibrahim Kasoma · Senior Frontend Engineer',
    /** Face + beard on avarta-cutout, image space from the top-left; the ink shader keeps it still. */
    avatarProtect: { x: 0.455, y: 0.34, rx: 0.15, ry: 0.19 },
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
    eyebrow: '01 · Core skills',
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
    eyebrow: '02 · Selected Work',
    heading: 'Public surfaces I have shipped.',
    items: [
      {
        slug: 'ef-epi',
        year: '2026',
        title: 'EF EPI · English Proficiency Index',
        role: 'Senior Frontend Engineer · Data Visualization',
        summary:
          'EF’s flagship data-viz platform, the English Proficiency Index. A Next.js application serving 57 international markets and 3.4M monthly users. I cut page load times by 60% and improved Core Web Vitals across all three.',
        stack: ['Next.js', 'TypeScript', 'Data Viz', 'Web Vitals'],
        metric: '−60% page load · 3.4M MAU · 57 markets',
        live: 'https://www.ef.com/epi',
      },
      {
        slug: 'ef-homepage',
        year: '2025',
        title: 'EF Homepage · ef.com',
        role: 'Senior Frontend Engineer · Brand surface',
        summary:
          'EF’s global homepage: Language. Education. Travel. Helped scale a shared platform behind the consumer brand surfaces, with daily multi-region releases on a CI/CD platform deploying 17 production frontend apps.',
        stack: ['Next.js', 'TypeScript', 'CMS', 'Edge Cache'],
        metric: '60+ markets · daily releases',
        live: 'https://www.ef.com',
      },
      {
        slug: 'ef-pg',
        year: '2024',
        title: 'EF Programs · All EF programs',
        role: 'Frontend Architecture · Microfrontends',
        summary:
          'The global catalog of EF’s language and travel programs. Architected the Nx monorepo that consolidated 20+ microfrontends across 8 product teams, eliminating 15,000+ lines of duplicate code and unifying releases behind a single shared pipeline.',
        stack: ['Next.js', 'Nx', 'TypeScript', 'Microfrontends'],
        metric: '20+ MFEs · −15k LOC · 8 teams',
        live: 'https://www.ef.com/pg',
      },
    ],
  },
  /** Before/after figures from the EF platform work (Impact section + demo `getImpact` tool). */
  impact: {
    compares: [
      {
        key: 'ci',
        label: 'CI pipeline time',
        delta: '−67%',
        caption: 'Rebuilt the shared CI/CD pipeline that ships 17 production front-end apps.',
        before: { pct: 100, value: '45 min' },
        after: { pct: 33, value: '15 min' },
      },
      {
        key: 'coverage',
        label: 'Test coverage',
        delta: '+55 pts',
        caption: 'Brought Jest + React Testing Library in and made tests part of every PR.',
        before: { pct: 30, value: '30%' },
        after: { pct: 85, value: '85%' },
      },
      {
        key: 'page-load',
        label: 'EPI page load',
        delta: '−60%',
        caption: 'Re-architected the EF EPI front end and its data layer; all three Core Web Vitals improved.',
        before: { pct: 100, value: 'baseline' },
        after: { pct: 40, value: '−60%' },
      },
      {
        key: 'incidents',
        label: 'Production incidents',
        delta: '−40%',
        caption: 'A downstream result of the coverage work and faster, safer rollbacks.',
        before: { pct: 100, value: 'baseline' },
        after: { pct: 60, value: '−40%' },
      },
    ],
    scale: [
      { value: 3.4, decimals: 1, suffix: 'M', label: 'Monthly active users' },
      { value: 57, suffix: '', label: 'International markets' },
      { value: 17, suffix: '', label: 'Production apps, deployed daily' },
    ],
  },
  showcase: {
    eyebrow: '03 · Showcase',
    heading: 'Things I built and shipped, outside of EF.',
    body: 'Side projects and freelance builds with public live deploys. Each one was shipped end to end: design, build, deploy, iterate.',
    items: [
      {
        slug: 'comp-lib',
        kind: 'Design Systems · Storybook',
        title: 'comp-lib · Component library lab',
        summary:
          'A personal design-system playground in Storybook: primitives, motion, theming, and accessibility patterns. The kind of internal lab that keeps a senior frontend engineer sharp on the basics.',
        stack: ['React', 'TypeScript', 'Storybook', 'Tailwind'],
        live: 'https://complib.kasomaibrahim.dev/?path=/docs/components-avatar--docs',
        repo: 'https://github.com/akibrahimug/comp-lib',
      },
      {
        slug: 'devops-insights',
        kind: 'DevOps · Dashboards',
        title: 'DevOps Insights · Real-time dashboard',
        summary:
          'Real-time monitoring dashboard for DevOps metrics across global regions. Charts, regional breakdowns, and signal-over-noise visual hierarchy.',
        stack: ['Next.js', 'TypeScript', 'Charting', 'Tailwind'],
        live: 'https://devops.kasomaibrahim.dev',
        repo: 'https://github.com/akibrahimug/devops-insights',
      },
      {
        slug: 'learner',
        kind: 'AI · Education',
        title: 'Learner · Real-time AI teaching platform',
        summary:
          'Real-time AI teaching platform with character-based companions and live learning sessions. An AI-native take on the tutor + classroom format.',
        stack: ['Next.js', 'TypeScript', 'AI', 'Realtime'],
        live: 'https://learner.kasomaibrahim.dev',
        repo: 'https://github.com/akibrahimug/learner',
      },
      {
        slug: 'puur-safaris',
        kind: 'Travel · CMS',
        title: 'Puur Uganda Reizen · Tailor-made safari trips',
        summary:
          'Discover Africa with Puur Uganda Reizen: personal, tailor-made safari trips to Uganda and beyond. Editorial photography and a CMS-driven trip catalog built for storytelling.',
        stack: ['Next.js', 'TypeScript', 'Tailwind', 'CMS'],
        live: 'https://www.puurugandareizen.nl',
        repo: 'https://github.com/akibrahimug/puur-safaris',
      },
      {
        slug: 'oliotya',
        kind: 'Travel · Marketing',
        title: 'Oliotya Uganda Safaris · Discover Uganda',
        summary:
          'Experience the Pearl of Africa: wildlife, mountains, gorilla trekking. A marketing site with rich content blocks, image galleries, and conversion-focused booking pathways.',
        stack: ['Next.js', 'Tailwind', 'Image-led layout'],
        live: 'https://www.oliotyaugandasafaris.com',
        repo: 'https://github.com/akibrahimug/Oliotya-Uganda-Safaris',
      },
      {
        slug: 'igcfashion',
        kind: 'Fashion · Catalog',
        title: 'IGCFashion · Multi-brand fashion catalog',
        summary:
          'A fashion catalog with multi-brand product grids, category navigation, an editorial layout, and image-led product cards on a JavaScript stack.',
        stack: ['JavaScript', 'Tailwind', 'Image-led'],
        live: 'https://www.igcfashion.africa',
        repo: 'https://github.com/akibrahimug/igc-site',
      },
    ],
  },
  experience: {
    eyebrow: '05 · Experience',
    heading: 'Where I have worked, what I shipped there.',
    roles: [
      {
        company: 'EF Education First',
        place: 'London, UK · Hybrid',
        title: 'Frontend Engineer',
        period: 'Dec 2023–Present',
        href: 'https://www.ef.com',
        bullets: [
          'Shipping seven concurrent EF projects across 80+ frontend apps and 60+ markets, including the EPI, Homepage, and Programs surfaces.',
          'Built and owned a shared CI/CD platform: pipeline 45 → 15 minutes, with daily multi-region releases.',
          'Cut page load times by 60% on a Next.js platform serving 57 international markets and 3.4M monthly users, improving Core Web Vitals across all three metrics.',
          'Architected an Nx monorepo consolidating 20+ microfrontends across 8 product teams, eliminating 15,000+ lines of duplicate code.',
          'Lifted test coverage from ~30% to 85% with Jest + React Testing Library, reducing production incidents by ~40%.',
          'Mentored engineers through code reviews, shared standards, and architecture discussions.',
        ],
      },
      {
        company: 'EF Education First',
        place: 'London, UK · Hybrid',
        title: 'Junior Frontend Developer (Contract)',
        period: 'Mar 2023–Dec 2023',
        href: 'https://www.ef.com',
        bullets: [
          'Migrated a legacy WordPress site to Next.js, cutting page loads by 45% and extending language support to 40+ languages.',
        ],
      },
      {
        company: 'San Damiano Ltd',
        place: 'Surrey, UK · Hybrid',
        title: 'Frontend Engineer (Full-Stack JavaScript)',
        period: 'Jun 2022–Feb 2023',
        bullets: [
          'Built internal tooling with React, Node.js, and Express, increasing employee productivity by ~40%.',
          'Automated manual workflows end to end: 4 hours → under 5 minutes.',
          'Designed and implemented REST APIs powering role-based frontend experiences for multiple internal user types.',
        ],
      },
      {
        company: 'Frontend Developer (Freelance)',
        place: 'London, UK',
        title: '',
        period: 'Feb 2020–Nov 2022',
        bullets: [
          'Core stack: React, JavaScript, Node.js.',
          'Delivered end-to-end web applications for multiple clients, managing requirements through production deployment.',
          'Integrated third-party REST APIs and shipped production-ready releases with responsive, accessible frontends.',
          'Translated business requirements into scalable technical solutions, balancing maintainability, usability, and delivery speed.',
        ],
      },
    ],
    education: [
      {
        school: 'Treehouse',
        course: 'Full-Stack JavaScript (React, Node.js)',
        period: '2021–2022',
      },
      {
        school: 'Zero To Mastery Academy',
        course: 'Algorithms & Data Structures (Self-Directed)',
        period: '2021–2022',
      },
    ],
  },
  tech: {
    eyebrow: '06 · Tech I reach for',
    heading: 'Day-to-day tools.',
    body: 'A live, searchable view of the stack I lean on across product engineering, platform work, and personal projects.',
  },
  currently: {
    eyebrow: '07 · Currently',
    heading: 'What I am up to right now.',
    asOf: 'Updated April 2026',
    items: [
      {
        k: 'Shipping',
        v: 'Seven concurrent EF projects across 60+ markets, including the EPI data-viz, the homepage, and the programs catalog.',
      },
      {
        k: 'Building',
        v: 'A platform CI/CD that ships 17 production frontend apps daily, and the Nx monorepo it sits on top of.',
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
    eyebrow: '08 · About',
    heading: 'Senior Frontend Engineer · TypeScript, React, Node.js.',
    paragraphs: [
      'Senior Frontend Engineer with 6+ years of experience building and scaling production TypeScript applications across frontend and backend-integrated systems. Strong track record delivering API-driven features end-to-end, improving performance and reliability, and contributing to architecture, CI/CD, and engineering standards in fast-moving product environments.',
      'Front-end engineer with strong Node.js and API integration experience, comfortable working across the stack to ship product features, improve developer workflows, and support scalable delivery in growing teams.',
      'Also available for freelance and contract engagements, remote-first, with on-site availability across Gloucestershire (Gloucester, Stroud, Cheltenham) and London.',
    ],
    facts: [
      { k: 'Years building', v: '6+' },
      { k: 'Apps shipped', v: '80+' },
      { k: 'Based in', v: 'Stroud, UK' },
      { k: 'Currently', v: 'EF Education First' },
    ],
  },
  contact: {
    eyebrow: '09 · Contact',
    heading: 'Let’s talk.',
    body: 'Fastest way to reach me is email. I read everything and reply within a day. The form is fine too if you prefer.',
    email: 'kasomaibrahim@gmail.com',
    socials: [
      { key: 'github', label: 'GitHub', href: 'https://github.com/akibrahimug' },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/kasomaibrahim/',
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
