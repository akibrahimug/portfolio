import { tool, type ToolSet } from 'ai'
import { z } from 'zod'
import { TOPICS, IMPACT_KEYS, STACK_AREAS, findWork, getImpact, getExperience, getStack, getContact } from './catalog'

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
  }),
  getImpact: tool({
    description:
      'Measured before/after results from the EF platform work (CI time, test coverage, page load, incidents) and the scale it runs at. Use for questions about impact, results, numbers, or metrics. Renders a chart.',
    inputSchema: z.object({
      focus: z
        .enum(IMPACT_KEYS)
        .optional()
        .describe('Only when the visitor names one specific metric; omit for general questions about results'),
    }),
    execute: async (input) => getImpact(input),
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
  }),
  getContact: tool({
    description: 'How to contact or hire him, and his availability. Renders a contact card.',
    inputSchema: z.object({}),
    execute: async () => getContact(),
  }),
} satisfies ToolSet

export type DemoToolName = keyof typeof demoTools
