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
      { href: '/#demo', label: 'Demo' },
      { href: '/#work', label: 'Work' },
      { href: '/#experience', label: 'Experience' },
      { href: '/#contact', label: 'Contact' },
    ],
  },
  cv: { label: 'Download CV', href: '/Ibrahim_Kasoma_CV.pdf' },
  hero: {
    /** h1 — names the category. `{ em }` segments render as the accent italic. */
    headline: ['Senior frontend engineer building', { em: 'AI-native' }, 'interfaces.'] as const,
    statement:
      'Six years of production TypeScript and React, 80+ apps shipped. At EF Education First I ship across a Next.js platform used by 3.4M people a month in 60+ markets.',
    location: 'Stroud, Gloucestershire, UK',
    primaryCta: { label: 'Email me', href: 'mailto:kasomaibrahim@gmail.com' },
    secondaryCta: { label: 'Ask AI (Live Demo)', href: '#demo' },
    avatarSrc: '/icons/avarta-cutout.webp',
    avatarWidth: 1221,
    avatarHeight: 1472,
    avatarAlt: 'Ibrahim Kasoma · Senior Frontend Engineer',
    /** Face + beard on avarta-cutout, image space from the top-left; the ink shader keeps it still. */
    avatarProtect: { x: 0.455, y: 0.34, rx: 0.15, ry: 0.19 },
  },
  skills: {
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
        // src: CV "AI-Assisted Development"; Vercel AI SDK: this site's live demo is built on it.
        label: 'AI-Assisted Development',
        items: [
          'Claude Code',
          'Coding agents',
          'MCP servers',
          'Agent context (CLAUDE.md, AGENTS.md)',
          'Skills authoring',
          'Agentic workflows',
          'Vercel AI SDK',
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
        items: ['Nx Monorepos', 'Micro-frontends', 'Git', 'Webpack', 'Vite', 'Storybook', 'Component Libraries'],
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
        /** Unambiguous, direction included: this is what the demo's model reads. */
        plain: 'CI pipeline runs 67% faster: 45 minutes down to 15.',
        delta: '−67%',
        caption: 'Rebuilt the shared CI/CD pipeline that ships 17 production front-end apps.',
        before: { pct: 100, value: '45 min' },
        after: { pct: 33, value: '15 min' },
      },
      {
        key: 'coverage',
        label: 'Test coverage',
        plain: 'Test coverage up 55 points: from 30% to 85%.',
        delta: '+55 pts',
        caption: 'Brought Jest + React Testing Library in and made tests part of every PR.',
        before: { pct: 30, value: '30%' },
        after: { pct: 85, value: '85%' },
      },
      {
        key: 'page-load',
        label: 'EPI page load',
        plain: 'EF EPI pages load 60% faster.',
        delta: '−60%',
        caption: 'Re-architected the EF EPI front end and its data layer; all three Core Web Vitals improved.',
        before: { pct: 100, value: 'baseline' },
        after: { pct: 40, value: '−60%' },
      },
      {
        key: 'incidents',
        label: 'Production incidents',
        plain: '40% fewer production incidents.',
        delta: '−40%',
        caption: 'A downstream result of the coverage work and faster, safer rollbacks.',
        before: { pct: 100, value: 'baseline' },
        after: { pct: 60, value: '−40%' },
      },
    ],
    scale: [
      { value: 3.4, decimals: 1, suffix: 'M', label: 'Monthly active users' },
      { value: 57, suffix: '', label: 'International markets' },
      { value: 17, suffix: '', label: 'Production apps deployed daily' },
    ],
  },
  showcase: {
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
    heading: 'Where I have worked, what I shipped there.',
    // Source of truth: public/Ibrahim_Kasoma_CV.pdf — keep the two in step.
    roles: [
      {
        company: 'EF Education First',
        place: 'London, UK · Hybrid',
        title: 'Senior Frontend Engineer',
        period: 'Mar 2023–Present',
        href: 'https://www.ef.com',
        bullets: [
          'Owns the shared CI/CD platform behind 17 production frontends deployed across 60+ markets. Parallelised builds and removed repeated package installs to bring pipeline duration from 45 minutes to 15, enabling daily multi-region releases.',
          'Diagnosed rendering and loading bottlenecks on a Next.js platform serving 57 markets and 3.4M monthly users; the work cut page load times by 60%, improved time to interactive by 3 seconds and lifted all three Core Web Vitals.',
          'Architected the Nx monorepo now used by 8 product teams, consolidating 20+ microfrontends and retiring 15,000+ lines of duplicated code behind one shared build and release pipeline.',
          'Led the headless CMS migration to Storyblok and Next.js for 3 production blogs covering 40+ languages, cutting load time by 45% and enabling same-day global content deployments.',
          'Established the shared component library the frontend estate now standardises on.',
          'Works agent-first with Claude Code, authoring the CLAUDE.md, AGENTS.md and Skills definitions that give coding agents the monorepo’s architecture and conventions.',
          'Introduced structured testing with Jest and React Testing Library, lifting coverage from ~30% to 85% and reducing production incidents by ~40%.',
          'Mentors engineers through code review and architecture discussions, and negotiates API contracts with backend teams for multi-region applications.',
        ],
      },
      {
        company: 'San Damiano Ltd',
        place: 'Surrey, UK · Hybrid',
        title: 'Frontend Engineer (Full-Stack JavaScript)',
        period: 'Jun 2022–Feb 2023',
        bullets: [
          'Built internal tooling with React, Node.js and Express that streamlined core business operations and increased employee productivity by ~40%.',
          'Automated manual workflows end to end, cutting critical processes from 4 hours to under 5 minutes.',
          'Designed and implemented REST APIs powering role-based frontend experiences across multiple internal user types.',
        ],
      },
      {
        company: 'Freelance',
        place: 'London, UK',
        title: 'Web Application Developer',
        period: 'Feb 2020–Nov 2022',
        bullets: [
          'Delivered end-to-end web applications for multiple clients using React, JavaScript and Node.js, owning each engagement from requirements through production deployment.',
          'Integrated third-party REST APIs and shipped production-ready releases with responsive, accessible frontends.',
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
  currently: {
    asOf: 'November 2026',
    items: [
      {
        k: 'Shipping',
        v: 'Consumer-facing experiences across EF’s international digital platforms, including the EPI, homepage and programmes catalogue.',
      },
      {
        k: 'Building',
        v: 'Shared frontend infrastructure, deployment pipelines and developer tooling that help multiple teams deliver independently.',
      },
      {
        k: 'Exploring',
        v: 'AI-assisted engineering, distributed systems and cloud infrastructure — particularly where they intersect with frontend platform architecture.',
      },
    ],
  },
  about: {
    // Ibrahim's own words (2026-11-07). Edit here, not in the component.
    heading: 'I engineer frontend systems built to scale.',
    paragraphs: [
      'I’m a frontend engineer based in Stroud, Gloucestershire. I work at the intersection of product engineering, frontend architecture and developer experience — turning complex systems into platforms that teams can build on confidently.',
      'At EF Education First, much of my work involves bringing structure to a fragmented frontend ecosystem. I’ve helped consolidate applications into an Nx monorepo, establish shared engineering conventions and build the CI/CD infrastructure supporting 17 production frontends across more than 60 markets. The goal isn’t simply cleaner code. It’s making software easier to maintain, faster to deliver and more reliable at scale.',
      'I’m particularly interested in how we build software, not just what we ship. I work with coding agents and build the architectural guidance, conventions and workflows that help them operate effectively within large codebases. I see AI as an opportunity to rethink engineering workflows while keeping technical judgement, ownership and quality firmly in human hands.',
      'Before EF, I developed internal tools at San Damiano and built web applications for independent clients. Those experiences shaped how I approach engineering today: understand the problem, question unnecessary complexity and build systems that can evolve without becoming harder to work with.',
    ],
  },
  contact: {
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
    repo: 'https://github.com/akibrahimug/portfolio',
  },
} as const

export type RedesignContent = typeof redesignContent
