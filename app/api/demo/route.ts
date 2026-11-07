import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type ModelMessage,
  type UIMessageStreamWriter,
} from 'ai'
import { demoTools, forModel, type DemoToolName } from '@/lib/demo/tools'
import { providerChain, INSTRUCTIONS, type Provider } from '@/lib/demo/providers'
import { writeOffline } from '@/lib/demo/offline'
import { allow } from '@/lib/demo/ratelimit'
import type { DemoUIMessage } from '@/lib/demo/types'

export const maxDuration = 30

const MAX_INPUT = 280
const HISTORY = 6

/** Chunks that carry no content: a provider that fails before anything else can be skipped silently. */
const NON_CONTENT = new Set(['start', 'start-step', 'finish-step', 'message-metadata', 'finish'])

type Chunk = Parameters<UIMessageStreamWriter<DemoUIMessage>['write']>[0]

const lastUserText = (messages: DemoUIMessage[]) => {
  const last = messages.at(-1)
  if (!last || last.role !== 'user') return null
  return last.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
    .trim()
}

type Result = { tool: DemoToolName; output: unknown }
type Attempt =
  | { kind: 'ok' }
  | { kind: 'skip' }
  /** Broke part-way (e.g. a tokens-per-minute limit between steps): results shown, no sentence. */
  | { kind: 'broken'; results: Result[] }
  /** Finished cleanly but never wrote its sentence (small models sometimes stop after a tool). */
  | { kind: 'mute'; results: Result[] }

/**
 * Try one provider. Its stream is buffered until the first content chunk: an error before
 * that (quota, 503, blocked model) means nothing reached the visitor, so the caller can move
 * to the next rung. Once committed, chunks pipe straight through; if it then breaks part-way
 * (e.g. a tokens-per-minute limit between steps), it reports the results already shown so
 * another provider can finish the sentence.
 */
async function tryLive(
  writer: UIMessageStreamWriter<DemoUIMessage>,
  p: Provider,
  messages: ModelMessage[],
  skipped: string[],
  signal: AbortSignal,
): Promise<Attempt> {
  const t0 = Date.now()
  const result = streamText({
    model: p.create(),
    instructions: INSTRUCTIONS,
    messages,
    tools: demoTools,
    // Every answer is built on a lookup made *now*: the first step must call a tool, so an answer
    // can never exist without the component that proves it.
    prepareStep: ({ stepNumber }) => (stepNumber === 0 ? { toolChoice: 'required' } : {}),
    stopWhen: isStepCount(3),
    maxOutputTokens: 400,
    maxRetries: 0,
    abortSignal: signal,
    onError: () => {}, // failures are handled below as stream parts
  })
  const reader = toUIMessageStream({
    stream: result.stream,
    sendStart: false,
    sendFinish: false,
    sendReasoning: false,
    onError: () => 'The model stopped unexpectedly.',
  }).getReader()

  const buffered: Chunk[] = []
  const names = new Map<string, DemoToolName>()
  const results: Result[] = []
  let firstTokenMs: number | undefined
  let wroteText = false
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = value as Chunk
    if (firstTokenMs === undefined) {
      if (chunk.type === 'error') {
        await reader.cancel().catch(() => {})
        return { kind: 'skip' }
      }
      buffered.push(chunk)
      if (NON_CONTENT.has(chunk.type)) continue
      firstTokenMs = Date.now() - t0
      writer.write({
        type: 'start',
        messageMetadata: { source: 'live', provider: p.provider, model: p.model, skipped },
      })
      buffered.forEach((b) => writer.write(b))
      buffered.forEach(track)
      continue
    }
    if (chunk.type === 'error') {
      await reader.cancel().catch(() => {})
      return { kind: 'broken', results }
    }
    track(chunk)
    writer.write(chunk)
  }
  if (firstTokenMs === undefined) return { kind: 'skip' }
  if (!wroteText && results.length) return { kind: 'mute', results }
  writer.write({ type: 'message-metadata', messageMetadata: { firstTokenMs, totalMs: Date.now() - t0 } })
  writer.write({ type: 'finish' })
  return { kind: 'ok' }

  function track(chunk: Chunk) {
    if (chunk.type === 'text-delta' && chunk.delta.trim()) wroteText = true
    if (chunk.type === 'tool-input-available') names.set(chunk.toolCallId, chunk.toolName as DemoToolName)
    if (chunk.type === 'tool-output-available') {
      const tool = names.get(chunk.toolCallId)
      if (tool) results.push({ tool, output: chunk.output })
    }
  }
}

const FINISH_INSTRUCTIONS = `You write the one or two sentences that answer a visitor's question about Ibrahim Kasoma, a senior frontend engineer, using ONLY the tool results given. Answer the question directly first; you may derive a duration, a count or a yes/no from the data. Never state or imply anything the results don't say (no "in production", "at scale", "led" unless stated). Refer to him as Ibrahim or he. Plain sentences, no markdown.`

/**
 * Results are on screen but there's no sentence: the answering model broke part-way, or stopped
 * after its tool call. Discard any half-written step and have a provider write just the sentence
 * from those results (no tools, nothing re-run).
 */
async function finishSentence(
  writer: UIMessageStreamWriter<DemoUIMessage>,
  providers: Provider[],
  question: string,
  results: Result[],
  signal: AbortSignal,
) {
  writer.write({ type: 'reset-step' })
  writer.write({ type: 'start-step' })
  const facts = results.map((r) => ({ tool: r.tool, result: forModel[r.tool](r.output as never) }))
  for (const p of providers) {
    const id = `finish-${Date.now()}`
    let started = false
    try {
      const r = streamText({
        model: p.create(),
        instructions: FINISH_INSTRUCTIONS,
        prompt: `Question: ${question}\n\nTool results (JSON):\n${JSON.stringify(facts)}`,
        maxOutputTokens: 160,
        maxRetries: 0,
        abortSignal: signal,
        onError: () => {},
      })
      for await (const delta of r.textStream) {
        if (!started) {
          writer.write({ type: 'text-start', id })
          started = true
        }
        writer.write({ type: 'text-delta', id, delta })
      }
    } catch {
      /* fall through to the next provider */
    }
    if (started) {
      writer.write({ type: 'text-end', id })
      writer.write({ type: 'finish-step' })
      writer.write({ type: 'message-metadata', messageMetadata: { finishedBy: p.model } })
      writer.write({ type: 'finish' })
      return
    }
  }
  const id = `finish-fallback-${Date.now()}`
  writer.write({ type: 'text-start', id })
  writer.write({
    type: 'text-delta',
    id,
    delta: 'The free model reached its usage limit before it could write a summary. What it found is below.',
  })
  writer.write({ type: 'text-end', id })
  writer.write({ type: 'finish-step' })
  writer.write({ type: 'finish' })
}

/**
 * The model sees the visitor's questions, never earlier answers or their tool results. Reused
 * results from history let it answer from memory ("the projects are listed below") with nothing
 * rendered — and the page's example answer lives in that history too.
 */
function questionsOnly(messages: DemoUIMessage[], current: string): ModelMessage[] {
  const earlier = messages
    .filter((m) => m.role === 'user')
    .slice(0, -1)
    .map((m) => m.parts.filter((p) => p.type === 'text').map((p) => p.text).join(' ').trim())
    .filter(Boolean)
    .slice(-3)
  const content = earlier.length
    ? `Earlier questions from this visitor, for context only:\n${earlier.map((q) => `- ${q}`).join('\n')}\n\nQuestion: ${current}`
    : current
  return [{ role: 'user', content }]
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { messages?: DemoUIMessage[] } | null
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-HISTORY) : []
  const text = lastUserText(messages)
  if (!text) return Response.json({ error: 'Ask a question.' }, { status: 400 })
  if (text.length > MAX_INPUT) {
    return Response.json({ error: `Keep it under ${MAX_INPUT} characters.` }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const allowed = await allow(ip)

  const stream = createUIMessageStream<DemoUIMessage>({
    execute: async ({ writer }) => {
      if (process.env.DEMO_OFFLINE === '1') {
        return writeOffline(writer, text, { offlineReason: 'unavailable' })
      }
      if (!allowed) return writeOffline(writer, text, { offlineReason: 'rate-limit' })

      const chain = providerChain()
      const modelMessages = questionsOnly(messages, text)
      const skipped: string[] = []
      for (const [i, p] of chain.entries()) {
        if (req.signal.aborted) return
        const attempt = await tryLive(writer, p, modelMessages, skipped, req.signal)
        if (attempt.kind === 'ok') return
        // Broken: that provider is out of capacity, so the next ones finish. Mute: it's fine, so it
        // goes first (a single tool-free call is cheap).
        if (attempt.kind === 'broken') return finishSentence(writer, chain.slice(i + 1), text, attempt.results, req.signal)
        if (attempt.kind === 'mute') return finishSentence(writer, chain.slice(i), text, attempt.results, req.signal)
        skipped.push(p.model)
      }
      await writeOffline(writer, text, {
        offlineReason: chain.length ? 'quota' : 'unavailable',
        skipped,
      })
    },
  })

  return createUIMessageStreamResponse({ stream })
}
