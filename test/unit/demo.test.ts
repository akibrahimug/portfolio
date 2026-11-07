// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { simulateReadableStream } from 'ai'
import { MockLanguageModelV4 } from 'ai/test'
import { findWork, getImpact, getStack, getContact, getExperience, careerTotals } from '@/lib/demo/catalog'
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

  it.each([
    ['MCP', 'MCP servers'],
    ['AI', 'Claude Code'],
    ['cloud', 'GitHub Actions'],
    ['testing', 'Cypress'],
  ])('a "%s" query finds %s', (query, item) => {
    const r = getStack({ query })
    expect(r.matched).toBe(true)
    expect(r.groups.flatMap((g) => g.items)).toContain(item)
  })

  it('an unfiltered stack lookup returns every area and every technology', () => {
    const all = getStack()
    expect(all.groups.map((g) => g.label)).toEqual(redesignContent.skills.groups.map((g) => g.label))
    expect(all.groups.map((g) => g.label)).toContain('AI-Assisted Development')
    const items = all.groups.flatMap((g) => g.items)
    for (const t of ['MCP servers', 'Claude Code', 'GitHub Actions', 'Vercel', 'Git', 'Jest', 'Docker']) expect(items).toContain(t)
    expect(all.tech).toHaveLength(25) // no cap
  })

  it('stack lookups filter, and an unknown technology returns nothing (no guessing)', () => {
    expect(getStack({ query: 'typescript' }).tech.map((t) => t.name)).toContain('TypeScript')
    // An unknown technology never comes back empty (a model would read that as "doesn't use it"):
    // the whole stack returns, flagged unmatched.
    const none = getStack({ query: 'cobol' })
    expect(none.matched).toBe(false)
    expect(none.groups.length).toBe(redesignContent.skills.groups.length)
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

  it('answers "how many years" specifically, computed from the role dates', () => {
    const r = routeOffline('how many years of experience does he have with product sites')
    expect(r.calls[0].name).toBe('getExperience')
    expect(r.lead).toMatch(/^About \d+ years of professional frontend work, since Feb 2020/)
    expect(r.lead).not.toMatch(/closest match/)
  })

  it('career totals come from the dates, not a hand-typed number', () => {
    const t = careerTotals(new Date(2026, 10, 7))
    expect(t).toMatchObject({ professionalSince: 'Feb 2020', yearsProfessional: 6, efSince: 'Mar 2023', yearsAtEf: 3 })
    expect(getExperience().totals.professionalSince).toBe('Feb 2020')
  })

  it('answers "does he know X" with a yes, or an honest "not listed"', () => {
    const yes = routeOffline('does he know TypeScript?')
    expect(yes.lead).toMatch(/^Yes/)
    expect(yes.calls[0]).toEqual({ name: 'getStack', input: { query: 'TypeScript' } })
    const no = routeOffline('does he have experience with cobol')
    expect(no.lead).toMatch(/cobol isn't listed/i)
  })

  it('the demo section opens on a real, rendered tool result', () => {
    const [q, a] = exampleMessages()
    expect(q.role).toBe('user')
    const tool = a.parts.find((p) => p.type === 'tool-findWork') as { state: string; output: { projects: unknown[] } }
    expect(tool.state).toBe('output-available')
    expect(tool.output.projects.length).toBeGreaterThan(0)
  })

  it('admits when it is only a loose match', () => {
    expect(routeOffline('tell me something').lead).toMatch(/closest match/)
  })

})

/* ----------------------------------------------------------------------------
 * Route: provider failover, offline and rate-limit paths, with mock models.
 * ------------------------------------------------------------------------- */
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
}
/** Answers step 1 with a tool call, then dies between steps like a tokens-per-minute limit. */
const breaksAfterTool = () => {
  let step = 0
  return new MockLanguageModelV4({
    doStream: async () => {
      if (++step > 1) throw new Error('Rate limit reached: tokens per minute (TPM)')
      const chunks = [
        { type: 'tool-call', toolCallId: 'c1', toolName: 'getExperience', input: '{}' },
        { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
      ]
      return { stream: simulateReadableStream({ chunks: chunks as never[] }) }
    },
  })
}
const writesSentence = () =>
  new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-start', id: 't' },
          { type: 'text-delta', id: 't', delta: 'About six years, since Feb 2020.' },
          { type: 'text-end', id: 't' },
          { type: 'finish', finishReason: { unified: 'stop', raw: undefined }, usage },
        ] as never[],
      }),
    }),
  })
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

  it('finishes the sentence with the next provider when one breaks after its results are on screen', async () => {
    chain.models = [
      { id: 'a', provider: 'Groq', model: 'model-a', create: breaksAfterTool },
      { id: 'b', provider: 'Groq', model: 'model-b', create: writesSentence },
    ]
    const { chunks, meta } = await ask('how many years of experience does he have?')
    expect(chunks.some((c) => c.type === 'error')).toBe(false) // the visitor never sees an error
    expect(chunks.find((c) => c.type === 'tool-output-available')?.output.totals).toBeDefined() // results kept
    expect(chunks.some((c) => c.type === 'reset-step')).toBe(true) // half-written step discarded
    const text = chunks.filter((c) => c.type === 'text-delta').map((c) => c.delta).join('')
    expect(text).toBe('About six years, since Feb 2020.')
    expect(meta).toMatchObject({ source: 'live', model: 'model-a', finishedBy: 'model-b' })
  })

  it('writes the missing sentence when a model stops after its tool call without one', async () => {
    let calls = 0
    const mute = () => {
      // Step 1: tool call. Step 2: finishes with no text. Step 3 (the finisher call): writes it.
      return new MockLanguageModelV4({
        doStream: async () => {
          calls++
          if (calls === 1) {
            const chunks = [
              { type: 'tool-call', toolCallId: 'c1', toolName: 'getExperience', input: '{}' },
              { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
            ]
            return { stream: simulateReadableStream({ chunks: chunks as never[] }) }
          }
          if (calls === 2) {
            return { stream: simulateReadableStream({ chunks: [{ type: 'finish', finishReason: { unified: 'stop', raw: undefined }, usage }] as never[] }) }
          }
          return writesSentence().doStream({} as never)
        },
      })
    }
    const shared = mute()
    chain.models = [{ id: 'a', provider: 'Groq', model: 'model-a', create: () => shared }]
    const { chunks, meta } = await ask('how many years of experience does he have?')
    const text = chunks.filter((c) => c.type === 'text-delta').map((c) => c.delta).join('')
    expect(text).toBe('About six years, since Feb 2020.')
    expect(meta).toMatchObject({ source: 'live', finishedBy: 'model-a' })
  })

  it('says so plainly when no provider is left to finish the sentence', async () => {
    chain.models = [{ id: 'a', provider: 'Groq', model: 'model-a', create: breaksAfterTool }]
    const { chunks } = await ask('how many years of experience does he have?')
    expect(chunks.some((c) => c.type === 'error')).toBe(false)
    const text = chunks.filter((c) => c.type === 'text-delta').map((c) => c.delta).join('')
    expect(text).toMatch(/reached its usage limit/)
  })

  it('impact results reach the model as plain sentences with their direction', async () => {
    const { forModel } = await import('@/lib/demo/tools')
    const r = forModel.getImpact(getImpact()).results
    expect(r).toContain('EF EPI pages load 60% faster.')
    for (const line of r) expect(line).toMatch(/faster|up|fewer/)
  })

  it('the model sees compact results, not the full component data', async () => {
    const { forModel } = await import('@/lib/demo/tools')
    const full = getStack()
    const compact = forModel.getStack(full)
    expect(JSON.stringify(compact).length).toBeLessThan(JSON.stringify(full).length * 0.75)
    // A "does he know GraphQL" question queries it directly; the honest scope travels with it.
    const graphql = forModel.getStack(getStack({ query: 'graphql' })).tech[0]
    expect(graphql).toMatchObject({ name: 'GraphQL', learnedFrom: 'Documentation, courses' })
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
