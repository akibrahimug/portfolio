'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import type { DemoUIMessage } from '@/lib/demo/types'
import { SUGGESTED_PROMPTS } from '@/lib/demo/prompts'
import { Answer } from './Answer'
import { useDemoChat } from './DemoChatProvider'
import { MarginNotes } from './MarginNotes'
import { useIntroReplay } from './useIntroReplay'
import { useTypewriter } from './useTypewriter'
import { Text, Eyebrow } from '@/components/ui/Typography'
import { Button, Arrow } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'

const MAX_INPUT = 280
const PLACEHOLDER = 'Ask about his work, results, stack…'

/** The generative-UI demo: questions in, the site's own components out. */
export function DemoConsole({ initialMessages }: { initialMessages: DemoUIMessage[] }) {
  const [input, setInput] = useState('')
  const [typed, setTyped] = useState('')
  const [focused, setFocused] = useState(false)
  const [showHow, setShowHow] = useState(false)
  const inputId = useId()
  const frameRef = useRef<HTMLDivElement>(null)
  // The site-wide conversation (shared with the sticky ask bar). Until anything is asked, the
  // frame shows the server-rendered example answer.
  const { messages: chatMessages, setMessages, sendMessage, status, stop, error, regenerate } = useDemoChat()
  const { replaying, finish } = useIntroReplay({ target: frameRef, example: initialMessages, setMessages, setTyped })
  const messages = chatMessages.length || replaying ? chatMessages : initialMessages

  const busy = status === 'submitted' || status === 'streaming'
  const working = busy || (replaying && !typed)
  const answer = [...messages].reverse().find((m) => m.role === 'assistant')
  const question = [...messages].reverse().find((m) => m.role === 'user')
  const questionText = question?.parts.find((p) => p.type === 'text')?.text
  const answerIsCurrent = !!answer && !!question && messages.indexOf(answer) > messages.indexOf(question)
  const placeholder = useTypewriter(SUGGESTED_PROMPTS, !busy && !replaying && !focused && !input, PLACEHOLDER)

  const ask = (text: string) => {
    const t = text.trim().slice(0, MAX_INPUT)
    if (!t || busy) return
    finish()
    sendMessage({ text: t })
    setInput('')
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  return (
    // min-w-0: grid items otherwise refuse to shrink below their content (overflow at 320px).
    <div className='grid gap-6 md:grid-cols-12 [&>*]:min-w-0'>
      <div className={cn('md:col-span-8', !showHow && 'md:col-span-12')}>
        <div
          ref={frameRef}
          // Any focus inside the demo ends the intro at once (it re-renders the answer area).
          onFocusCapture={finish}
          className={cn(
            'demo-frame relative border bg-card/40 transition-colors duration-500',
            working ? 'border-accent/70' : 'border-border-strong',
          )}
          data-working={working || undefined}
        >
          {/* question + status */}
          <div className='flex items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-7'>
            <div className='min-h-14 min-w-0'>
              <Eyebrow as='span' className='tracking-wider'>
                {answer?.metadata?.source === 'example' || replaying ? 'Example question' : 'You asked'}
              </Eyebrow>
              {questionText && <p className='demo-land mt-1 font-display text-display-sm italic'>“{questionText}”</p>}
            </div>
            <div className='flex shrink-0 items-center gap-4'>
              <button
                type='button'
                aria-pressed={showHow}
                onClick={() => setShowHow((v) => !v)}
                className='min-h-9 border border-border px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent hover:text-foreground aria-pressed:border-accent aria-pressed:text-accent'
              >
                {showHow ? 'Hide how' : 'Show how'}
              </button>
            </div>
          </div>

          {/* answer */}
          <div className='min-h-80 px-5 py-6 md:px-7' aria-live={replaying ? 'off' : 'polite'} aria-busy={working}>
            {status === 'submitted' && !answerIsCurrent ? (
              <p className='demo-pending text-sm text-muted-foreground'>Reading the site…</p>
            ) : answer && answerIsCurrent ? (
              <Answer message={answer} />
            ) : null}
            {error && (
              <div role='alert' className='mt-4 flex items-center gap-4 text-sm text-accent'>
                Something went wrong.
                <button type='button' className='underline underline-offset-4' onClick={() => regenerate()}>
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* ask */}
          <form onSubmit={onSubmit} className='border-t border-border px-5 py-4 md:px-7'>
            <label htmlFor={inputId} className='sr-only'>
              Ask about Ibrahim&apos;s work
            </label>
            <div className='flex gap-3'>
              <input
                id={inputId}
                value={typed || input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  setFocused(true)
                  finish()
                }}
                onBlur={() => setFocused(false)}
                maxLength={MAX_INPUT}
                placeholder={placeholder}
                autoComplete='off'
                className='min-w-0 flex-1 border-b border-border-strong bg-transparent py-2.5 text-base placeholder:text-faint focus-visible:border-accent'
              />
              {busy ? (
                <Button variant='outline' onClick={() => stop()}>
                  Stop
                </Button>
              ) : (
                <Button type='submit' disabled={!input.trim()} className={cn(typed && 'demo-press')}>
                  Ask
                  <Arrow />
                </Button>
              )}
            </div>
            <ul className='mt-4 flex flex-wrap gap-2' aria-label='Suggested questions'>
              {SUGGESTED_PROMPTS.map((p) => (
                <li key={p}>
                  <button
                    type='button'
                    disabled={busy}
                    onClick={() => ask(p)}
                    className='min-h-9 border border-border px-3 py-1.5 text-sm text-muted-foreground transition-[color,border-color,transform] duration-200 hover:border-accent hover:text-foreground motion-safe:hover:-translate-y-px disabled:opacity-50'
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </form>
        </div>
      </div>

      {showHow && (
        <aside className='demo-land md:col-span-4' aria-label='How this answer was made'>
          <MarginNotes message={answerIsCurrent ? answer : undefined} busy={working} />
        </aside>
      )}
    </div>
  )
}
