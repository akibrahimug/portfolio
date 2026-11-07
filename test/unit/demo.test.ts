// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { simulateReadableStream } from 'ai'
import { MockLanguageModelV4 } from 'ai/test'
import { findWork, getImpact, getStack, getContact, getExperience } from '@/lib/demo/catalog'
import { routeOffline, exampleMessages } from '@/lib/demo/offline'
import { SUGGESTED_PROMPTS } from '@/lib/demo/prompts'
import { redesignContent } from '@/lib/redesign-content'
// vi.mock calls below are hoisted above this import, so the route sees the mocks.
import { POST } from '@/app/api/demo/route'

/* ----------------------------------------------------------------------------
 * Grounding: the tools can only return what the content file holds.
 * ------------------------------------------------------------------------- */
describe('demo catalog (grounding)', () => {
  it('finds the AI work and only real projects', () => {
    const { projects } = findWork({ topic: 'ai' })
    expect(projects.map((p) => p.slug)).toEqual(['learner'])
    const allSlugs = [...redesignContent.work.items, ...redesignContent.showcase.items].map((p) => p.slug)
    for (const p of findWork({ limit: 6 }).projects) expect(allSlugs).toContain(p.slug)
  })

  it('performance work leads with EF EPI and carries its real metric', () => {
    const epi = findWork({ topic: 'performance' }).projects.find((p) => p.slug === 'ef-epi')
    expect(epi?.metric).toBe(redesignContent.work.items[0].metric)
  })

  it('impact figures are exactly the content figures', () => {
    expect(getImpact().compares.map((c) => c.delta)).toEqual(redesignContent.impact.compares.map((c) => c.delta))
    expect(getImpact({ focus: 'ci' }).compares).toHaveLength(1)
  })

  it('stack lookups filter, and an unknown technology returns nothing (no guessing)', () => {
    expect(getStack({ query: 'typescript' }).tech.map((t) => t.name)).toContain('TypeScript')
    const none = getStack({ query: 'cobol' })
    expect(none.tech).toHaveLength(0)
    expect(none.groups).toHaveLength(0)
  })

  it('experience and contact mirror the content', () => {
    expect(getExperience().roles).toHaveLength(redesignContent.experience.roles.length)
    expect(getContact().email).toBe(redesignContent.contact.email)
  })
})

/* ----------------------------------------------------------------------------
 * Offline router: every suggested prompt is scripted; free text routes sensibly.
 * ------------------------------------------------------------------------- */
describe('offline router', () => {
  it('scripts every suggested prompt', () => {
    for (const p of SUGGESTED_PROMPTS) expect(routeOffline(p).calls.length).toBeGreaterThan(0)
  })

  it.each([
    ['can I email him?', 'getContact'],
    ['what results did he get', 'getImpact'],
    ['where has he worked', 'getExperience'],
    ['anything with storybook?', 'findWork'],
    ['does he know react', 'getStack'],
    ['tell me something', 'findWork'],
  ])('%s → %s', (q, tool) => {
    expect(routeOffline(q).calls[0].name).toBe(tool)
  })

  it('the example answer is a real, rendered tool result', () => {
    const [q, a] = exampleMessages()
    expect(q.role).toBe('user')
    const tool = a.parts.find((p) => p.type === 'tool-findWork') as { state: string; output: { projects: unknown[] } }
    expect(tool.state).toBe('output-available')
    expect(tool.output.projects.length).toBeGreaterThan(0)
  })
})

/* ----------------------------------------------------------------------------
 * Route: provider failover, offline and rate-limit paths, with mock models.
 * ------------------------------------------------------------------------- */
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
}
const failing = () =>
  new MockLanguageModelV4({
    doStream: async () => {
      throw new Error('429 quota exceeded')
    },
  })
const answering = () => {
  let step = 0
  return new MockLanguageModelV4({
    doStream: async () => {
      step++
      const chunks =
        step === 1
          ? [
              { type: 'tool-call', toolCallId: 'c1', toolName: 'findWork', input: '{"topic":"ai"}' },
              { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
            ]
          : [
              { type: 'text-start', id: 't' },
              { type: 'text-delta', id: 't', delta: 'Here is his AI work.' },
              { type: 'text-end', id: 't' },
              { type: 'finish', finishReason: { unified: 'stop', raw: undefined }, usage },
            ]
      return { stream: simulateReadableStream({ chunks: chunks as never[] }) }
    },
  })
}

const chain = vi.hoisted(() => ({ models: [] as Array<{ id: string; provider: string; model: string; create: () => unknown }> }))
const limiter = vi.hoisted(() => ({ allowed: true }))
vi.mock('@/lib/demo/providers', async (orig) => ({
  ...(await orig<typeof import('@/lib/demo/providers')>()),
  providerChain: () => chain.models,
}))
vi.mock('@/lib/demo/ratelimit', () => ({ allow: async () => limiter.allowed, rateLimitEnabled: true }))


async function ask(text: string) {
  const res = await POST(
    new Request('http://localhost/api/demo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ id: 'u', role: 'user', parts: [{ type: 'text', text }] }] }),
    }),
  )
  const body = await res.text()
  const chunks = body
    .split('\n')
    .filter((l) => l.startsWith('data: ') && l !== 'data: [DONE]')
    .map((l) => JSON.parse(l.slice(6)))
  const meta = Object.assign({}, ...chunks.filter((c) => c.messageMetadata).map((c) => c.messageMetadata))
  return { res, chunks, meta }
}

describe('POST /api/demo', () => {
  beforeEach(() => {
    limiter.allowed = true
    vi.unstubAllEnvs()
  })

  it('skips a provider that fails before any content, invisibly, and answers with the next', async () => {
    chain.models = [
      { id: 'a', provider: 'Groq', model: 'model-a', create: failing },
      { id: 'b', provider: 'Groq', model: 'model-b', create: answering },
    ]
    const { chunks, meta } = await ask('What has he built with AI?')
    expect(meta).toMatchObject({ source: 'live', model: 'model-b', skipped: ['model-a'] })
    expect(chunks.filter((c) => c.type === 'start')).toHaveLength(1) // the failed attempt left no trace
    expect(chunks.some((c) => c.type === 'error')).toBe(false)
    const output = chunks.find((c) => c.type === 'tool-output-available')?.output
    expect(output.projects.map((p: { slug: string }) => p.slug)).toEqual(['learner'])
    expect(typeof meta.firstTokenMs).toBe('number')
  })

  it('falls back to the offline router with real data when every model fails', async () => {
    chain.models = [{ id: 'a', provider: 'Groq', model: 'model-a', create: failing }]
    const { chunks, meta } = await ask("What's his stack?")
    expect(meta).toMatchObject({ source: 'offline', offlineReason: 'quota', skipped: ['model-a'] })
    expect(chunks.find((c) => c.type === 'tool-input-available')?.toolName).toBe('getStack')
  })

  it('serves rate-limited visitors offline without calling a model', async () => {
    const create = vi.fn(answering)
    chain.models = [{ id: 'a', provider: 'Groq', model: 'model-a', create }]
    limiter.allowed = false
    const { meta } = await ask('How do I hire him?')
    expect(meta).toMatchObject({ source: 'offline', offlineReason: 'rate-limit' })
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects empty and over-long questions', async () => {
    expect((await ask('   ')).res.status).toBe(400)
    expect((await ask('x'.repeat(281))).res.status).toBe(400)
  })
})
