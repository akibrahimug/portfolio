import { isStaticToolUIPart } from 'ai'
import type { DemoUIMessage } from '@/lib/demo/types'
import type { DemoToolName } from '@/lib/demo/tools'
import { VIEW_NAMES } from './results/registry'
import { Eyebrow } from '@/components/ui/Typography'

const OFFLINE_REASON = {
  quota: 'every free model was out of quota',
  'rate-limit': 'you have asked a lot in the last few minutes',
  unavailable: 'no model is configured here',
} as const

const args = (input: unknown) => {
  const entries = Object.entries((input ?? {}) as Record<string, unknown>).filter(([, v]) => v !== undefined && v !== '')
  return entries.length ? `{ ${entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')} }` : ''
}

const count = (output: unknown): string | null => {
  const o = output as Record<string, unknown> | undefined
  if (!o) return null
  const n = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]).length : null)
  const projects = n('projects')
  if (projects !== null) return `${projects} project${projects === 1 ? '' : 's'}`
  const roles = n('roles')
  if (roles !== null) return `${roles} role${roles === 1 ? '' : 's'}`
  const compares = n('compares')
  if (compares !== null) return `${compares} metric${compares === 1 ? '' : 's'}`
  const tech = n('tech')
  if (tech !== null) return `${tech} technologies`
  return null
}

/** Print-style footnotes explaining how the current answer was produced. */
export function MarginNotes({ message, busy }: { message?: DemoUIMessage; busy: boolean }) {
  const m = message?.metadata
  const notes: React.ReactNode[] = []

  if (!message) notes.push(busy ? 'Waiting for the first token…' : 'Ask something to see how the answer is made.')
  else if (m?.source === 'live')
    notes.push(
      <>
        Answered live by <strong className='font-medium text-foreground'>{m.model}</strong> on {m.provider}&apos;s free tier.
        {m.skipped?.length ? ` Skipped ${m.skipped.join(', ')} (unavailable or out of quota).` : ''}
      </>,
    )
  else if (m?.source === 'example')
    notes.push('An example answer, rendered with the page from the same tools a live model would call. No model was involved.')
  else if (m?.source === 'offline')
    notes.push(
      <>
        No model answered this one: {OFFLINE_REASON[m.offlineReason ?? 'unavailable']}. A keyword router picked the tool
        instead, so the data is real; only the first sentence is pre-written.
      </>,
    )

  for (const part of message?.parts ?? []) {
    if (!isStaticToolUIPart(part)) continue
    const name = part.type.slice('tool-'.length) as DemoToolName
    const done = part.state === 'output-available'
    notes.push(
      <>
        Called <code className='font-mono text-[12px] text-foreground'>{name}({args(part.input)})</code>
        {done && count(part.output) ? `, which returned ${count(part.output)}` : ''}. Rendered as{' '}
        <code className='font-mono text-[12px] text-foreground'>{`<${VIEW_NAMES[name]} />`}</code>, the same component
        library this page is built from.
      </>,
    )
  }

  if (m?.firstTokenMs !== undefined)
    notes.push(`First token after ${m.firstTokenMs} ms; finished after ${m.totalMs} ms.`)
  else if (m?.totalMs !== undefined && m.source !== 'example') notes.push(`Finished after ${m.totalMs} ms.`)

  if (message)
    notes.push(
      'The model can only see what these tools return, so it cannot invent a number. It is told to refuse questions that are not about this work.',
    )

  return (
    <div className='border-l border-border pl-5 md:sticky md:top-24'>
      <Eyebrow>How this answer was made</Eyebrow>
      <ol className='mt-4 space-y-4'>
        {notes.map((n, i) => (
          <li key={i} className='flex gap-3 text-sm leading-relaxed text-muted-foreground'>
            <span className='font-display text-accent' aria-hidden>
              {i + 1}
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
