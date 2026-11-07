'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { isStaticToolUIPart } from 'ai'
import type { DemoUIMessage } from '@/lib/demo/types'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The first time the demo scrolls into view, it plays the example answer as if it were live:
 * the question types itself, the tool call appears, results land, the sentence streams.
 *
 * Runs entirely client-side from the server-computed example (no model call, no quota), through
 * the same `setMessages` → render path a real answer uses. Any interaction cancels it and
 * restores the finished example. Skipped under reduced motion.
 */
export function useIntroReplay({
  target,
  example,
  setMessages,
  setTyped,
}: {
  target: RefObject<HTMLElement | null>
  example: DemoUIMessage[]
  setMessages: (m: DemoUIMessage[]) => void
  setTyped: (t: string) => void
}) {
  const [replaying, setReplaying] = useState(false)
  const timers = useRef<number[]>([])
  const done = useRef(false)

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    timers.current.forEach(clearTimeout)
    timers.current = []
    setTyped('')
    setMessages(example)
    setReplaying(false)
  }, [example, setMessages, setTyped])

  useEffect(() => {
    const el = target.current
    const [q, a] = example
    if (!el || !q || !a || reducedMotion()) return
    const question = q.parts.find((p) => p.type === 'text')?.text ?? ''
    const lead = a.parts.find((p) => p.type === 'text')?.text ?? ''
    const tools = a.parts.filter(isStaticToolUIPart)
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

    const play = () => {
      setReplaying(true)
      setMessages([])
      let t = 300
      for (let i = 1; i <= question.length; i++) {
        at(t, () => setTyped(question.slice(0, i)))
        t += 34
      }
      at((t += 380), () => {
        setTyped('')
        setMessages([q])
      })
      // The model "calls" its tool…
      at((t += 650), () =>
        setMessages([q, { ...a, parts: tools.map((p) => ({ ...p, state: 'input-available', output: undefined })) as DemoUIMessage['parts'] }]),
      )
      // …the result lands…
      at((t += 750), () => setMessages([q, { ...a, parts: tools }]))
      // …then the sentence streams in over it.
      const words = lead.split(/(?<= )/)
      t += 200
      words.forEach((_, i) => {
        const text = words.slice(0, i + 1).join('')
        const state = i === words.length - 1 ? 'done' : 'streaming'
        at((t += 55), () => setMessages([q, { ...a, parts: [{ type: 'text', text, state }, ...tools] }]))
      })
      at(t + 120, finish)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return
        io.disconnect()
        play()
      },
      { threshold: 0.45 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.current.forEach(clearTimeout)
    }
    // Plays once per mount; `example` is static server content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { replaying, finish }
}
