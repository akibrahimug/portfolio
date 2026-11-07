/**
 * Model-free answers. Used when every free model is out of quota, the visitor is rate-limited,
 * or no keys are configured. Suggested prompts get a scripted lead-in; free text is routed to
 * the right tool by keywords. Either way the tool *runs for real*, so the data is identical
 * to a live answer — only the sentence on top is canned.
 */
import type { UIMessageStreamWriter } from 'ai'
import { findWork, getImpact, getExperience, getStack, getContact, type Topic } from './catalog'
import type { DemoUIMessage, DemoMetadata } from './types'
import type { DemoToolName } from './tools'
import { SUGGESTED_PROMPTS } from './prompts'

type Call = { [K in DemoToolName]: { name: K; input: Record<string, unknown> } }[DemoToolName]

export { SUGGESTED_PROMPTS }

// Answers are about Ibrahim in the third person: the model never speaks *as* him.
const SCRIPTS: Record<(typeof SUGGESTED_PROMPTS)[number], { lead: string; calls: Call[] }> = {
  'Show me his performance work': {
    lead: "Ibrahim's performance work, pulled from the projects on this site:",
    calls: [{ name: 'findWork', input: { topic: 'performance' } }],
  },
  'What has he built with AI?': {
    lead: 'The AI work on this site:',
    calls: [{ name: 'findWork', input: { topic: 'ai' } }],
  },
  'What results did he move at EF?': {
    lead: "Before and after, from Ibrahim's EF platform work:",
    calls: [{ name: 'getImpact', input: {} }],
  },
  "What's his stack?": {
    lead: "Ibrahim's stack, by depth of experience:",
    calls: [{ name: 'getStack', input: {} }],
  },
  'How do I hire him?': {
    lead: 'Email is the fastest way to reach Ibrahim. Everything else is here:',
    calls: [{ name: 'getContact', input: {} }],
  },
}

const TOPIC_WORDS: Array<[RegExp, Topic]> = [
  [/perf|fast|speed|vitals|load/i, 'performance'],
  [/\bai\b|llm|machine learning|gpt|model/i, 'ai'],
  [/design.?system|storybook|component/i, 'design-systems'],
  [/platform|monorepo|nx|micro.?frontend|pipeline|ci/i, 'platform'],
  [/chart|dashboard|data.?vi[sz]/i, 'data-viz'],
  [/test|coverage|jest|cypress/i, 'testing'],
  [/cms|content/i, 'cms'],
]

/** Deterministic keyword router: free text → the tool call a model would most likely make. */
export function routeOffline(text: string): { lead: string; calls: Call[] } {
  const scripted = SCRIPTS[text.trim() as keyof typeof SCRIPTS]
  if (scripted) return scripted
  const t = text.toLowerCase()
  if (/hire|contact|email|reach|available|cv|resume/.test(t))
    return { lead: 'How to reach Ibrahim:', calls: [{ name: 'getContact', input: {} }] }
  if (/result|impact|metric|number|moved|improv|measur/.test(t))
    return { lead: "Measured results from Ibrahim's EF platform work:", calls: [{ name: 'getImpact', input: {} }] }
  if (/worked|work(s|ed)? (at|for)|where .*work|career|experience|job|role|employ|compan/.test(t))
    return { lead: 'Where Ibrahim has worked:', calls: [{ name: 'getExperience', input: {} }] }
  const topic = TOPIC_WORDS.find(([re]) => re.test(t))?.[1]
  if (topic) return { lead: 'The closest match on this site:', calls: [{ name: 'findWork', input: { topic } }] }
  if (/stack|tech|language|framework|tool|know|react|typescript|node/.test(t))
    return { lead: "Ibrahim's stack, by depth of experience:", calls: [{ name: 'getStack', input: {} }] }
  return { lead: "A good place to start, Ibrahim's strongest work:", calls: [{ name: 'findWork', input: {} }] }
}

export const RUN: Record<DemoToolName, (input: never) => unknown> = {
  findWork: findWork as (i: never) => unknown,
  getImpact: getImpact as (i: never) => unknown,
  getExperience: getExperience as (i: never) => unknown,
  getStack: getStack as (i: never) => unknown,
  getContact: getContact as (i: never) => unknown,
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Stream an offline answer through the same UI message protocol a live model uses. */
export async function writeOffline(
  writer: UIMessageStreamWriter<DemoUIMessage>,
  text: string,
  meta: DemoMetadata,
  { pace = true }: { pace?: boolean } = {},
) {
  const t0 = Date.now()
  const { lead, calls } = routeOffline(text)
  writer.write({ type: 'start', messageMetadata: { source: 'offline', ...meta } })
  writer.write({ type: 'start-step' })
  const id = `offline-text-${t0}`
  writer.write({ type: 'text-start', id })
  for (const word of lead.split(/(?<= )/)) {
    writer.write({ type: 'text-delta', id, delta: word })
    if (pace) await pause(18)
  }
  writer.write({ type: 'text-end', id })
  for (const [i, call] of calls.entries()) {
    const toolCallId = `offline-${t0}-${i}`
    writer.write({ type: 'tool-input-available', toolCallId, toolName: call.name, input: call.input })
    if (pace) await pause(120)
    writer.write({ type: 'tool-output-available', toolCallId, output: RUN[call.name](call.input as never) })
  }
  writer.write({ type: 'finish-step' })
  writer.write({ type: 'message-metadata', messageMetadata: { totalMs: Date.now() - t0 } })
  writer.write({ type: 'finish' })
}

/**
 * The frame's resting state: a real answer to the first suggested prompt, computed from the
 * same tools at render time, so the demo never shows an empty box.
 */
export function exampleMessages(): DemoUIMessage[] {
  const question = SUGGESTED_PROMPTS[0]
  const { lead, calls } = routeOffline(question)
  return [
    { id: 'example-q', role: 'user', parts: [{ type: 'text', text: question }] },
    {
      id: 'example-a',
      role: 'assistant',
      metadata: { source: 'example' },
      parts: [
        { type: 'text', text: lead, state: 'done' },
        ...calls.map(
          (call, i) =>
            ({
              type: `tool-${call.name}`,
              toolCallId: `example-${i}`,
              state: 'output-available',
              input: call.input,
              output: RUN[call.name](call.input as never),
            }) as DemoUIMessage['parts'][number],
        ),
      ],
    },
  ]
}
