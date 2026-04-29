export const siteContent = {
  meta: {
    title: 'Kasoma Ibrahim — Senior Frontend Engineer',
    description:
      'Senior frontend engineer building accessible, performance-obsessed interfaces for AI-era products.',
    ogImage: '/icons/avarta.webp',
  },
  hero: {
    kicker: "Hi, I'm",
    name: 'Ibrahim',
    role: 'Senior Frontend Engineer',
    roleRotation: ['Senior Frontend Engineer', 'Platform Engineer', 'UX Engineer'],
    tagline: 'I build production React and Next.js for international, multi-brand products.',
  },
  about: {
    heading: 'About me',
    paragraphs: [
      "Senior frontend engineer building production React and Next.js used in international markets. I work across the stack where it matters most for users — performance, accessibility, and motion that earns its keep.",
      "Most recently at EF Education First, I helped scale an Nx monorepo and shared CI/CD pipelines across multiple consumer brands, partnered with content teams on a CMS-driven publishing workflow, and invested in DX so improvements compound across teams instead of dying inside one app.",
      "I care about clean, well-tested code (Jest, React Testing Library, Playwright), pragmatic architecture, and shipping interfaces that feel fast — the kind of work that holds up to the AI-era bar of \"simple but powerful\".",
    ],
    resumeFile: 'KASOMA_IBRAHIM_CV_2025.pdf',
    resumeLabel: 'Download CV',
  },
  footer: {
    tagline: 'Senior frontend engineer. Building for the web with care.',
    copyrightName: 'Kasoma Ibrahim',
  },
  contact: {
    heading: 'Get in touch',
    subheading: 'If you prefer an alternative way',
    labels: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      message: 'Message (300 words max)',
      submit: 'Send',
      submitting: 'Sending…',
    },
    success: 'Message sent. I will reply within a day.',
  },
  avarta: { scroll: 'Scroll', down: 'Down' },
  navButtons: {
    emailMe: 'Email me',
    techStack: 'Tech stack',
    dashboard: 'Dashboard',
    emailSubject: 'Re: your senior frontend role',
    emailBody: 'Hi Kasoma,\n\nI saw your portfolio and would like to chat about a role.\n\n',
  },
} as const

export type SiteContent = typeof siteContent
