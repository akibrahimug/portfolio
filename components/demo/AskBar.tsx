'use client'

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { DemoUIMessage } from '@/lib/demo/types'
import { SUGGESTED_PROMPTS } from '@/lib/demo/prompts'
import { Answer } from './Answer'
import { MarginNotes } from './MarginNotes'
import { useTypewriter } from './useTypewriter'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { Button, Arrow } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'

const MAX_INPUT = 280
const PLACEHOLDER = 'Ask about his work, results, stack…'
const transport = new DefaultChatTransport<DemoUIMessage>({ api: '/api/demo' })

/**
 * Show the bar once the home page's hero has scrolled away; everywhere else, always.
 * A plain position check on scroll, not an IntersectionObserver: one started during the browser's
 * smooth scroll to a hash (e.g. /#work) reported the hero as visible and never fired again.
 */
function useBarVisible(pathname: string) {
  const [heroGone, setHeroGone] = useState(pathname !== '/')
  useEffect(() => {
    if (pathname !== '/') return setHeroGone(true)
    let frame = 0
    const check = () => {
      frame = 0
      const hero = document.getElementById('top')
      // Moved on from the hero: its bottom edge has risen into the top 40% of the screen.
      setHeroGone(!hero || hero.getBoundingClientRect().bottom <= window.innerHeight * 0.4)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', onScroll)
    }
  }, [pathname])
  return heroGone
}

/**
 * The live demo, as a sticky ask bar under the nav on every page. Asking opens the answer in a
 * panel that drops down from the bar, over the page; Esc, ✕ or a click outside closes it and the
 * reader is exactly where they were. `#ask` links (the hero button) open and focus it.
 */
export function AskBar() {
  const pathname = usePathname()
  const heroGone = useBarVisible(pathname ?? '/')
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [showHow, setShowHow] = useState(false)
  const inputId = useId()
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages, sendMessage, status, stop, error, regenerate } = useChat<DemoUIMessage>({ transport })

  const busy = status === 'submitted' || status === 'streaming'
  const visible = heroGone || focused || open
  const answer = [...messages].reverse().find((m) => m.role === 'assistant')
  const question = [...messages].reverse().find((m) => m.role === 'user')
  const questionText = question?.parts.find((p) => p.type === 'text')?.text
  const answerIsCurrent = !!answer && !!question && messages.indexOf(answer) > messages.indexOf(question)
  const placeholder = useTypewriter(SUGGESTED_PROMPTS, visible && !busy && !focused && !input && !open, PLACEHOLDER)

  const ask = (text: string) => {
    const t = text.trim().slice(0, MAX_INPUT)
    if (!t || busy) return
    sendMessage({ text: t })
    setInput('')
    setOpen(true)
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }
  const focusBar = useCallback(() => {
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
  }, [])

  // `#ask` links (the hero's "Ask AI" button) open the bar instead of jumping.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href$="#ask"]')
      if (!a) return
      e.preventDefault()
      focusBar()
    }
    document.addEventListener('click', onClick)
    if (window.location.hash === '#ask') focusBar()
    return () => document.removeEventListener('click', onClick)
  }, [focusBar])

  // Esc or a click outside closes the panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      id='ask'
      className={cn(
        'fixed inset-x-0 top-16 z-40 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
      )}
      // Hidden over the hero: out of the tab order and the accessibility tree until it slides in.
      inert={!visible}
    >
      <div className={cn('border-b bg-background/95 backdrop-blur-md', busy ? 'border-accent/60' : 'border-border')}>
        <Container>
          <form onSubmit={onSubmit} className='relative flex items-center gap-3 py-2.5'>
            {busy && <span aria-hidden className='demo-scan pointer-events-none absolute inset-x-0 -bottom-px h-0.5' />}
            <label htmlFor={inputId} className='shrink-0 text-xs uppercase tracking-wider text-faint'>
              Ask AI
            </label>
            <input
              id={inputId}
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => {
                setFocused(true)
                setOpen(true)
              }}
              onBlur={() => setFocused(false)}
              maxLength={MAX_INPUT}
              placeholder={placeholder}
              autoComplete='off'
              aria-expanded={open}
              aria-controls={panelId}
              className='min-w-0 flex-1 bg-transparent py-2 text-base placeholder:text-faint'
            />
            {busy ? (
              <Button variant='outline' className='py-2' onClick={() => stop()}>
                Stop
              </Button>
            ) : (
              <Button type='submit' className='py-2' disabled={!input.trim()}>
                Ask
                <Arrow />
              </Button>
            )}
          </form>
        </Container>
      </div>

      {open && (
        <Container className='mt-2'>
          <section
            id={panelId}
            aria-label='Answer'
            className='demo-land max-h-[calc(100svh-10rem)] overflow-y-auto border border-border-strong bg-background shadow-[0_24px_48px_-24px_rgb(0_0_0/0.25)]'
          >
            <div className='flex items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-7'>
              <div className='min-w-0'>
                <Eyebrow as='span' className='tracking-wider'>
                  {questionText ? 'You asked' : 'Ask about Ibrahim’s work'}
                </Eyebrow>
                {questionText ? (
                  <p className='mt-1 font-display text-display-sm italic'>“{questionText}”</p>
                ) : (
                  <p className='mt-1 max-w-xl text-sm text-muted-foreground'>
                    A free model answers from this site’s own data and shows the answer as the same components the
                    page uses. It can’t invent a figure. “Show how” explains each answer.
                  </p>
                )}
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                {questionText && (
                  <button
                    type='button'
                    aria-pressed={showHow}
                    onClick={() => setShowHow((v) => !v)}
                    className='min-h-9 border border-border px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent hover:text-foreground aria-pressed:border-accent aria-pressed:text-accent'
                  >
                    {showHow ? 'Hide how' : 'Show how'}
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  aria-label='Close answer'
                  className='inline-flex min-h-9 min-w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground'
                >
                  ✕
                </button>
              </div>
            </div>

            {questionText && (
              <div className='grid gap-6 px-5 py-6 md:grid-cols-12 md:px-7 [&>*]:min-w-0'>
                <div className={cn('md:col-span-12', showHow && 'md:col-span-8')} aria-live='polite' aria-busy={busy}>
                  {status === 'submitted' && !answerIsCurrent ? (
                    <p className='demo-pending text-sm text-muted-foreground'>Reading the site…</p>
                  ) : answer && answerIsCurrent ? (
                    // Following anything the answer suggested (a case study, Email Ibrahim) closes the panel.
                    <div onClick={(e) => (e.target as Element).closest('a') && setOpen(false)}>
                      <Answer message={answer} />
                    </div>
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
                {showHow && (
                  <aside className='demo-land md:col-span-4' aria-label='How this answer was made'>
                    <MarginNotes message={answerIsCurrent ? answer : undefined} busy={busy} />
                  </aside>
                )}
              </div>
            )}

            <ul className='flex flex-wrap gap-2 border-t border-border px-5 py-4 md:px-7' aria-label='Suggested questions'>
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
          </section>
        </Container>
      )}
    </div>
  )
}
