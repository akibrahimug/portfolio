'use client'

import * as React from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

function useCountUp(target: string, enabled: boolean) {
  // Parse leading number out of strings like "3.4", "60", "6+"
  const match = target.match(/^(\d+(\.\d+)?)/)
  const final = match ? parseFloat(match[1]) : null
  const suffix = match ? target.slice(match[0].length) : target
  const [v, setV] = React.useState<number | null>(enabled && final != null ? 0 : final)

  React.useEffect(() => {
    if (!enabled || final == null) {
      setV(final)
      return
    }
    const duration = 1100
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setV(Number((eased * final).toFixed(final < 10 ? 1 : 0)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [final, enabled])

  if (final == null) return target
  const display = final < 10 && !Number.isInteger(final) ? (v ?? 0).toFixed(1) : Math.round(v ?? 0)
  return `${display}${suffix}`
}

function Stat({
  value,
  suffix,
  label,
  sub,
}: {
  value: string
  suffix: string
  label: string
  sub: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduced = useReducedMotion()
  const display = useCountUp(value, !reduced && inView)

  return (
    <div ref={ref} className='group relative'>
      <div className='flex items-baseline gap-1 text-foreground'>
        <span className='font-mono text-5xl font-semibold tracking-tight tabular-nums md:text-6xl'>
          {display}
        </span>
        <span className='font-mono text-2xl font-semibold text-brand-500 md:text-3xl'>
          {suffix}
        </span>
      </div>
      <p className='mt-3 max-w-[18ch] text-sm font-medium text-foreground'>{label}</p>
      <p className='mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground'>
        {sub}
      </p>
    </div>
  )
}

export function StatsBand() {
  const reduced = useReducedMotion()
  const { eyebrow, items } = redesignContent.stats

  return (
    <section className='border-b border-border py-16 md:py-24'>
      <div className='mx-auto max-w-6xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
          {eyebrow}
        </p>
        <motion.ul
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className='mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-12 md:grid-cols-4 md:gap-x-10'
        >
          {items.map((s) => (
            <li key={s.label}>
              <Stat {...s} />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
