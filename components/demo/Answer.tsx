'use client'

import { isStaticToolUIPart } from 'ai'
import type { DemoUIMessage } from '@/lib/demo/types'
import type { DemoToolName } from '@/lib/demo/tools'
import { RESULT_VIEWS } from './results/registry'
import { Text } from '@/components/ui/Typography'

type Part = DemoUIMessage['parts'][number]
const toolName = (part: Part) => part.type.slice('tool-'.length) as DemoToolName

const OFFLINE_NOTE = {
  'rate-limit':
    'You’ve asked a lot in the last few minutes, so the live model is paused for you briefly. This answer comes straight from the site’s data.',
  quota: 'The free models are out of quota right now, so this answer comes straight from the site’s data, without a model.',
  unavailable: 'No live model is connected here, so this answer comes straight from the site’s data.',
} as const

function ToolResult({ part }: { part: Part }) {
  if (!isStaticToolUIPart(part)) return null
  if (part.state === 'output-error') return <Text size='sm'>That lookup failed. Try asking another way.</Text>
  if (part.state !== 'output-available') {
    return <div className='demo-pending h-40 border border-dashed border-border' aria-label='Loading result' />
  }
  const View = RESULT_VIEWS[toolName(part)] as React.ComponentType<{ output: unknown }>
  return (
    <div className='demo-land'>
      <View output={part.output} />
    </div>
  )
}

/**
 * One answer: the honest offline note (when no model answered), the model's sentence — always
 * first, whatever order it streamed in — and each tool result as the site component it maps to.
 */
export function Answer({ message }: { message: DemoUIMessage }) {
  return (
    <div className='space-y-6'>
      {message.metadata?.source === 'offline' && (
        <p className='demo-land border-l-2 border-accent pl-3 text-sm text-muted-foreground'>
          {OFFLINE_NOTE[message.metadata.offlineReason ?? 'unavailable']}
        </p>
      )}
      {message.parts.map((part, i) =>
        part.type === 'text' && part.text.trim() ? (
          <Text key={i} size='lead' tone='default'>
            {part.text}
            {part.state === 'streaming' && <span className='demo-caret' aria-hidden />}
          </Text>
        ) : null,
      )}
      {message.parts.map((part) =>
        isStaticToolUIPart(part) ? <ToolResult key={part.toolCallId} part={part} /> : null,
      )}
    </div>
  )
}
