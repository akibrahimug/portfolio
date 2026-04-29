/**
 * Centralized content for the redesigned portfolio home page.
 * One source of truth — edit copy here, not in components.
 */

export const redesignContent = {
  meta: {
    title: 'Kasoma Ibrahim — Senior Frontend Engineer',
    description:
      'Senior frontend engineer building accessible, performance-obsessed interfaces for AI-era products.',
  },
  nav: {
    brand: 'Kasoma Ibrahim',
    links: [
      { href: '#work', label: 'Work' },
      { href: '#about', label: 'About' },
      { href: '#connect', label: 'Connect' },
    ],
  },
  hero: {
    eyebrow: 'Frontend · Platform · UX',
    name: 'Kasoma Ibrahim.',
    rolePool: [
      'Senior Frontend Engineer',
      'Platform Engineer',
      'Design-curious Engineer',
      'UX Engineer',
    ],
    statement:
      'I build production React and Next.js for international, multi-brand products. Most recently at EF Education First — an Nx monorepo, shared CI/CD, and CMS-driven systems serving multiple consumer brands.',
    status: { label: 'Available · Senior frontend roles, UK', dotColor: 'bg-emerald-400' },
    primaryCta: { label: 'Email me', href: 'mailto:kasomaibrahim@gmail.com' },
  },
  ticker: [
    'TypeScript',
    'React',
    'Next.js',
    'Tailwind',
    'Nx',
    'Node',
    'GraphQL',
    'Playwright',
    'Jest',
    'CI/CD',
    'Performance',
    'Accessibility',
    'Design Systems',
  ],
  work: {
    eyebrow: '01 — Selected Work',
    heading: 'A few things I am proud of.',
    items: [
      {
        slug: 'ef-platform',
        year: '2024',
        title: 'EF Education First — Platform & DX',
        role: 'Senior Frontend Engineer',
        summary:
          'Scaled an Nx monorepo and shared CI/CD across multiple consumer brands. Invested in DX so improvements compounded across teams instead of dying inside one app.',
        stack: ['Nx', 'Next.js', 'TypeScript', 'CMS', 'CI/CD'],
        href: '#',
      },
      {
        slug: 'design-system',
        year: '2024',
        title: 'Cross-brand Component Library',
        role: 'Frontend Architecture',
        summary:
          'Headless component library shared across consumer brands — themed via design tokens, automated visual regression, semver-tagged releases.',
        stack: ['React', 'Tailwind', 'Storybook', 'Chromatic'],
        href: '#',
      },
      {
        slug: 'cms',
        year: '2023',
        title: 'CMS-driven Marketing Platform',
        role: 'Frontend Lead',
        summary:
          'Headless CMS publishing workflow with on-demand revalidation and edge-cached previews. Content teams own pages end to end without engineering involvement.',
        stack: ['Next.js', 'Sanity', 'Vercel Edge'],
        href: '#',
      },
      {
        slug: 'portfolio',
        year: '2026',
        title: 'This portfolio',
        role: 'Design + Build',
        summary:
          'Designed and built end to end. Pages Router, Tailwind v4, Framer Motion, MongoDB-backed admin, GCS uploads. Aimed at the AI-2026 senior-IC bar.',
        stack: ['Next.js', 'TypeScript', 'Tailwind v4', 'Framer Motion'],
        href: 'https://github.com/akibrahimug/portfolio',
      },
    ],
  },
  about: {
    eyebrow: '02 — About',
    heading: 'I care about craft, performance, and pragmatic architecture.',
    paragraphs: [
      'Senior frontend engineer with a deep focus on production React and Next.js. I work where it matters most for users: performance, accessibility, and motion that earns its keep.',
      'I value clean, well-tested code, thoughtful design, and the kind of platform investments that let small teams ship like big ones — Nx, shared pipelines, design systems, automated previews.',
      'Currently shipping at EF Education First. Open to senior frontend roles in the UK.',
    ],
    facts: [
      { k: 'Years building', v: '5+' },
      { k: 'Based in', v: 'London, UK' },
      { k: 'Lately', v: 'AI tooling, View Transitions, Tailwind v4' },
    ],
  },
  connect: {
    eyebrow: '03 — Connect',
    heading: 'Let’s talk.',
    body: 'The fastest way to reach me is email. I read everything. I reply within a day.',
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
    line: '© 2026 Kasoma Ibrahim. Built with Next.js, Tailwind, and Framer Motion.',
    repo: 'https://github.com/akibrahimug/portfolio',
  },
} as const

export type RedesignContent = typeof redesignContent
