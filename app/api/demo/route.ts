import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessageStreamWriter,
} from 'ai'
import { demoTools } from '@/lib/demo/tools'
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

/**
 * Try one provider. Its stream is buffered until the first content chunk: an error before
 * that (quota, 503, blocked model) means nothing reached the visitor, so the caller can move
 * to the next rung. Once committed, chunks pipe straight through.
 */
async function tryLive(
  writer: UIMessageStreamWriter<DemoUIMessage>,
  p: Provider,
  messages: Awaited<ReturnType<typeof convertToModelMessages>>,
  skipped: string[],
  signal: AbortSignal,
): Promise<boolean> {
  const t0 = Date.now()
  const result = streamText({
    model: p.create(),
    instructions: INSTRUCTIONS,
    messages,
    tools: demoTools,
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
  let firstTokenMs: number | undefined
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = value as Chunk
    if (firstTokenMs === undefined) {
      if (chunk.type === 'error') {
        await reader.cancel().catch(() => {})
        return false
      }
      buffered.push(chunk)
      if (NON_CONTENT.has(chunk.type)) continue
      firstTokenMs = Date.now() - t0
      writer.write({
        type: 'start',
        messageMetadata: { source: 'live', provider: p.provider, model: p.model, skipped },
      })
      buffered.forEach((b) => writer.write(b))
      continue
    }
    writer.write(chunk)
  }
  if (firstTokenMs === undefined) return false
  writer.write({ type: 'message-metadata', messageMetadata: { firstTokenMs, totalMs: Date.now() - t0 } })
  writer.write({ type: 'finish' })
  return true
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
      const modelMessages = await convertToModelMessages(messages)
      const skipped: string[] = []
      for (const p of chain) {
        if (req.signal.aborted) return
        if (await tryLive(writer, p, modelMessages, skipped, req.signal)) return
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
