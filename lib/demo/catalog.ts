/**
 * The demo's single source of truth: pure, deterministic queries over the site's own content.
 *
 * The model never sees free-form facts — it can only call tools that wrap these functions,
 * and the offline mode calls them directly. Either way the numbers on screen are the
 * numbers in `redesign-content.ts`, never generated ones.
 */
import { redesignContent as c } from '@/lib/redesign-content'
import techData from '@/lib/technologies.json'
import { caseStudySlugs } from '@/lib/case-studies'

export const TOPICS = [
  'performance',
  'platform',
  'design-systems',
  'data-viz',
  'ai',
  'testing',
  'cms',
] as const
export type Topic = (typeof TOPICS)[number]

export type WorkRecord = {
  slug: string
  title: string
  kind: string
  year?: string
  summary: string
  metric?: string
  stack: string[]
  live?: string
  repo?: string
  /** Where it was built: inside EF, or independently (freelance / personal). */
  origin: 'ef' | 'independent'
  /** Internal case-study page, when the project has one. */
  caseStudy?: string
}

const TOPIC_PATTERNS: Record<Topic, RegExp> = {
  performance: /page load|web vitals|performance|edge cache|−\d+%/i,
  platform: /monorepo|\bnx\b|microfrontend|pipeline|ci\/cd|platform|releases/i,
  'design-systems': /design.system|storybook|component|primitives/i,
  'data-viz': /data.viz|dashboard|chart/i,
  ai: /\bai\b/i,
  testing: /\btest|coverage|jest|cypress/i,
  cms: /\bcms\b/i,
}

const ALL_WORK: WorkRecord[] = [
  ...c.work.items.map((w) => ({
    slug: w.slug,
    title: w.title,
    kind: w.role,
    year: w.year,
    summary: w.summary,
    metric: w.metric,
    stack: [...w.stack],
    live: w.live,
    origin: 'ef' as const,
  })),
  ...c.showcase.items.map((s) => ({
    slug: s.slug,
    title: s.title,
    kind: s.kind,
    summary: s.summary,
    stack: [...s.stack],
    live: s.live,
    repo: 'repo' in s ? s.repo : undefined,
    origin: 'independent' as const,
  })),
]

for (const w of ALL_WORK) if (caseStudySlugs.has(w.slug)) w.caseStudy = `/work/${w.slug}`

const haystack = (w: WorkRecord) => [w.title, w.kind, w.summary, w.metric ?? '', ...w.stack].join(' ')

/** Projects, optionally narrowed to a topic and/or where they were built. */
export function findWork({
  topic,
  origin,
  limit = 3,
}: { topic?: Topic; origin?: WorkRecord['origin']; limit?: number } = {}) {
  const matches = ALL_WORK.filter(
    (w) => (!topic || TOPIC_PATTERNS[topic].test(haystack(w))) && (!origin || w.origin === origin),
  )
  return { topic: topic ?? null, total: matches.length, projects: matches.slice(0, Math.min(limit, 6)) }
}

/** Measured before/after results from the EF platform work, plus the scale it runs at. */
export function getImpact({ focus }: { focus?: string } = {}) {
  const compares = c.impact.compares
    .filter((m) => !focus || m.key === focus)
    .map((m) => ({ ...m, before: { ...m.before }, after: { ...m.after } }))
  return {
    compares: compares.length ? compares : c.impact.compares.map((m) => ({ ...m })),
    scale: c.impact.scale.map((s) => ({ ...s })),
  }
}
export const IMPACT_KEYS = c.impact.compares.map((m) => m.key) as [string, ...string[]]

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
/** 'Feb 2020–Nov 2022' → the start as a Date (first of the month). */
const startOf = (period: string) => {
  const [mon, year] = period.split('–')[0].trim().split(' ')
  return new Date(Number(year), MONTHS.indexOf(mon.toLowerCase().slice(0, 3)), 1)
}
const wholeYears = (from: Date, to: Date) =>
  Math.floor((to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())) / 12

/** Career totals, computed from the role dates (never typed in by hand). */
export function careerTotals(now = new Date()) {
  const starts = c.experience.roles.map((r) => startOf(r.period))
  const first = new Date(Math.min(...starts.map((d) => d.getTime())))
  const ef = c.experience.roles
    .filter((r) => r.company.includes('EF Education First'))
    .map((r) => startOf(r.period))
  const efStart = new Date(Math.min(...ef.map((d) => d.getTime())))
  const label = (d: Date) => d.toLocaleString('en-GB', { month: 'short', year: 'numeric' })
  return {
    professionalSince: label(first),
    yearsProfessional: Math.floor(wholeYears(first, now)),
    efSince: label(efStart),
    yearsAtEf: Math.floor(wholeYears(efStart, now)),
  }
}

/** Roles, most recent first, with their top highlights, plus computed career totals. */
export function getExperience({ company }: { company?: string } = {}) {
  const roles = c.experience.roles
    .filter((r) => !company || r.company.toLowerCase().includes(company.toLowerCase()))
    .map((r) => ({
      company: r.company,
      title: r.title || undefined,
      period: r.period,
      place: r.place,
      highlights: r.bullets.slice(0, 3),
    }))
  return { totals: careerTotals(), roles }
}

type Tech = { name: string; icon: string; experience?: string; confidenceLevel?: number; description?: string; learningSource?: string }
const TECH = (techData as { techStack: Tech[] }).techStack

/** Skills by area, and the tools with depth of experience (most confident first). */
export function getStack({ area, query }: { area?: string; query?: string } = {}) {
  const q = query?.trim().toLowerCase()
  const groups = c.skills.groups
    .filter((g) => !area || g.label.toLowerCase().includes(area.toLowerCase()))
    .map((g) => ({
      label: g.label,
      items: [...g.items].filter((i) => !q || i.toLowerCase().includes(q)),
    }))
    .filter((g) => g.items.length)
  const tech = TECH.filter((t) => !q || t.name.toLowerCase().includes(q))
    .map((t) => ({
      name: t.name,
      icon: t.icon,
      experience: t.experience,
      confidence: t.confidenceLevel ?? null,
      /** Ibrahim's own note on how he has used it — the model must not claim more than this. */
      note: t.description,
      learnedFrom: t.learningSource,
    }))
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 14)
  return { groups, tech }
}
export const STACK_AREAS = c.skills.groups.map((g) => g.label) as [string, ...string[]]

/** How to reach Ibrahim. */
export function getContact() {
  return {
    email: c.contact.email,
    cv: c.cv.href,
    socials: c.contact.socials.map((s) => ({ label: s.label, href: s.href })),
  }
}
