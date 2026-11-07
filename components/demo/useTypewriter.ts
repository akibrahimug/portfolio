'use client'

import { useEffect, useState } from 'react'

/**
 * Cycles suggested questions through an input's placeholder: type, hold, erase, next.
 * The one timed loop on the page; stops whenever `active` is false (busy, focused, typed in).
 */
export function useTypewriter(lines: readonly string[], active: boolean, fallback: string) {
  const [text, setText] = useState(fallback)

  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(fallback)
      return
    }
    let line = 0
    let i = 0
    let erasing = false
    let timer = 0
    const tick = () => {
      const full = `Try: ${lines[line]}`
      if (!erasing) {
        i++
        setText(full.slice(0, i))
        if (i >= full.length) {
          erasing = true
          timer = window.setTimeout(tick, 1800)
          return
        }
        timer = window.setTimeout(tick, 42)
      } else {
        i -= 2
        setText(full.slice(0, Math.max(i, 0)))
        if (i <= 0) {
          erasing = false
          line = (line + 1) % lines.length
          timer = window.setTimeout(tick, 350)
          return
        }
        timer = window.setTimeout(tick, 18)
      }
    }
    timer = window.setTimeout(tick, 800)
    return () => clearTimeout(timer)
  }, [active, lines, fallback])

  return text
}
