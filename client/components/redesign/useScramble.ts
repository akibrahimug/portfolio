import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#%&$@01'

/**
 * Decoder/scramble effect: each character cycles through random glyphs
 * before locking to its target, sequentially. Returns the current display
 * value, updated on each animation frame until the transition completes.
 * When `enabled` is false, returns the target value immediately.
 */
export function useScramble(target: string, enabled: boolean): string {
  const [display, setDisplay] = useState(target)
  const lastTargetRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setDisplay(target)
      lastTargetRef.current = target
      return
    }
    const old = lastTargetRef.current
    if (old === target) return

    const length = Math.max(old.length, target.length)
    type Slot = { from: string; to: string; start: number; end: number; ch?: string }
    const queue: Slot[] = []
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * 18)
      const end = start + 14 + Math.floor(Math.random() * 22)
      queue.push({ from: old[i] || ' ', to: target[i] || ' ', start, end })
    }

    let frame = 0
    const tick = () => {
      let out = ''
      let done = 0
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i]
        if (frame >= q.end) {
          done++
          out += q.to
        } else if (frame >= q.start) {
          if (!q.ch || Math.random() < 0.28) {
            q.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          }
          out += q.ch
        } else {
          out += q.from
        }
      }
      setDisplay(out)
      if (done === queue.length) {
        lastTargetRef.current = target
        return
      }
      frame++
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, enabled])

  return display
}
