import { tool, type ToolSet } from 'ai'
import type { findWork as FindWork, getImpact as GetImpact, getExperience as GetExperience, getStack as GetStack, getContact as GetContact } from './catalog'
import { z } from 'zod'
import { TOPICS, STACK_AREAS, findWork, getImpact, getExperience, getStack, getContact } from './catalog'

const firstSentence = (s?: string) => (s ? (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim().slice(0, 220) : undefined)

/**
 * What the *model* sees of each result: a compact summary. The UI still receives the full
 * output for its component. Free tiers meter tokens per minute, and every step re-sends
 * earlier results, so this keeps a multi-step answer to a fraction of the tokens.
 */
export const forModel = {
  findWork: (o: ReturnType<typeof FindWork>) => ({
    total: o.total,
    projects: o.projects.map((p) => ({
      title: p.title,
      where: p.origin === 'ef' ? 'EF Education First' : 'independent',
      year: p.year,
      metric: p.metric,
      about: firstSentence(p.summary),
      stack: p.stack.slice(0, 4),
    })),
  }),
  getImpact: (o: ReturnType<typeof GetImpact>) => ({
    // Plain sentences carry the direction (faster, up, fewer); raw deltas like "−60%" got misread.
    results: o.compares.map((m) => m.plain),
    scale: o.scale.map((s) => `${s.value}${s.suffix} ${s.label.toLowerCase()}`),
  }),
  getExperience: (o: ReturnType<typeof GetExperience>) => ({
    totals: o.totals,
    roles: o.roles.map((r) => ({ company: r.company, title: r.title, period: r.period, topHighlight: r.highlights[0] })),
  }),
  getStack: (o: ReturnType<typeof GetStack>) => ({
    tech: o.tech.map((t) => ({ name: t.name, experience: t.experience, note: firstSentence(t.note), learnedFrom: t.learnedFrom })),
    areas: o.groups.map((g) => `${g.label}: ${g.items.join(', ')}`),
  }),
  getContact: (o: ReturnType<typeof GetContact>) => ({ email: o.email, cv: 'downloadable', socials: o.socials.map((s) => s.label) }),
}
const json = <T,>(fn: (o: T) => unknown) => ({ output }: { output: T }) => ({ type: 'json' as const, value: fn(output) as never })

/**
 * The only way the model can learn anything about Ibrahim. Each tool is a thin, validated
 * wrapper over a pure catalog query — results render as the site's own components.
 */
export const demoTools = {
  findWork: tool({
    description:
      "Find Ibrahim's projects. Use for questions about his work, projects, case studies, or experience with a topic (e.g. performance, AI, design systems). Renders project cards.",
    inputSchema: z.object({
      topic: z
        .enum(TOPICS)
        .optional()
        .describe('Only when the question is about one of these topics; omit for his strongest work'),
      origin: z
        .enum(['ef', 'independent'])
        .optional()
        .describe("'ef' = built at EF Education First; 'independent' = freelance/personal"),
      limit: z.number().int().min(1).max(6).optional(),
    }),
    execute: async (input) => findWork(input),
    toModelOutput: json(forModel.findWork),
  }),
  getImpact: tool({
    description:
      'All measured before/after results from the EF platform work (CI time, test coverage, page load, incidents) and the scale it runs at. Use for questions about impact, results, numbers, or metrics. Renders a chart.',
    // Deliberately no filter: with four metrics, the whole chart always answers better,
    // and small models over-narrowed it when given the option.
    inputSchema: z.object({}),
    execute: async () => getImpact(),
    toModelOutput: json(forModel.getImpact),
  }),
  getExperience: tool({
    description: 'His roles and employers, most recent first. Use for career, jobs, or "where have you worked". Renders a timeline.',
    inputSchema: z.object({
      company: z
        .string()
        .max(40)
        .optional()
        .describe('Only when the visitor names a specific employer; omit otherwise'),
    }),
    execute: async (input) => getExperience(input),
    toModelOutput: json(forModel.getExperience),
  }),
  getStack: tool({
    description:
      'Technologies and skills with depth of experience. Use for stack, languages, frameworks, tools, or "do you know X". Renders a skills field.',
    inputSchema: z.object({
      area: z.enum(STACK_AREAS).optional(),
      query: z
        .string()
        .max(40)
        .optional()
        .describe('Only when the visitor names a specific technology; omit otherwise'),
    }),
    execute: async (input) => getStack(input),
    toModelOutput: json(forModel.getStack),
  }),
  getContact: tool({
    description: 'How to contact or hire him. Renders a contact card.',
    inputSchema: z.object({}),
    execute: async () => getContact(),
    toModelOutput: json(forModel.getContact),
  }),
} satisfies ToolSet

export type DemoToolName = keyof typeof demoTools
