'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

const format = (n: number, decimals: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/**
 * A number that settles to its value when scrolled into view.
 * Writes to the DOM directly (no per-frame React renders); SSR/reduced motion show the final value.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  duration = 1.1,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  duration?: number
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  // Below the fold, park at zero after hydration so the count has somewhere to start from.
  useEffect(() => {
    const el = ref.current
    if (el && !reduced && !inView) el.textContent = `${prefix}${format(0, decimals)}${suffix}`
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${format(v, decimals)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, reduced, value, decimals, prefix, suffix, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  )
}
