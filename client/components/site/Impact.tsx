'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Section, Reveal, CountUp } from './primitives'

type Compare = {
  label: string
  delta: string
  caption: string
  before: { pct: number; value: string }
  after: { pct: number; value: string }
}

// Real before/after figures from the EF platform work, each with the story behind it.
const COMPARES: Compare[] = [
  {
    label: 'CI pipeline time',
    delta: '−67%',
    caption: 'Rebuilt the shared CI/CD pipeline that ships 17 production front-end apps.',
    before: { pct: 100, value: '45 min' },
    after: { pct: 33, value: '15 min' },
  },
  {
    label: 'Test coverage',
    delta: '+55 pts',
    caption: 'Brought Jest + React Testing Library in and made tests part of every PR.',
    before: { pct: 30, value: '30%' },
    after: { pct: 85, value: '85%' },
  },
  {
    label: 'EPI page load',
    delta: '−60%',
    caption: 'Re-architected the EF EPI front end and its data layer; all three Core Web Vitals improved.',
    before: { pct: 100, value: 'baseline' },
    after: { pct: 40, value: '−60%' },
  },
  {
    label: 'Production incidents',
    delta: '−40%',
    caption: 'A downstream result of the coverage work and faster, safer rollbacks.',
    before: { pct: 100, value: 'baseline' },
    after: { pct: 60, value: '−40%' },
  },
]

const SCALE = [
  { value: 3.4, decimals: 1, suffix: 'M', label: 'Monthly active users' },
  { value: 57, suffix: '', label: 'International markets' },
  { value: 17, suffix: '', label: 'Production apps shipped daily' },
]

function Bar({
  pct,
  value,
  accent,
  reduced,
  delay,
}: {
  pct: number
  value: string
  accent?: boolean
  reduced: boolean | null
  delay: number
}) {
  return (
    <div className='flex items-center gap-3'>
      <div className='relative h-2 flex-1 overflow-hidden bg-muted'>
        <motion.div
          className={accent ? 'h-full bg-accent' : 'h-full bg-foreground/20'}
          initial={reduced ? false : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
          style={reduced ? { width: `${pct}%` } : undefined}
        />
      </div>
      <span className='w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground'>
        {value}
      </span>
    </div>
  )
}

export function Impact() {
  const reduced = useReducedMotion()

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section
        id='impact'
        index='02'
        eyebrow='Measured impact'
        title='I own a shared delivery platform at EF.'
        intro='It sits behind 17 production front-end apps across 60+ markets. Rebuilding it — the pipeline, the test culture, the EPI front end — moved real numbers. Here is the before and after.'
      >
        {/* the story: what changed */}
        <div className='grid gap-x-14 gap-y-12 sm:grid-cols-2'>
          {COMPARES.map((c) => (
            <Reveal as='div' key={c.label}>
              <div className='flex items-baseline justify-between gap-4'>
                <span className='font-display text-lg font-medium'>{c.label}</span>
                <span className='font-display text-2xl font-medium text-accent'>{c.delta}</span>
              </div>
              <p className='mt-2 max-w-md text-sm leading-relaxed text-muted-foreground'>{c.caption}</p>
              <div className='mt-4 space-y-2'>
                <Bar pct={c.before.pct} value={c.before.value} reduced={reduced} delay={0} />
                <Bar pct={c.after.pct} value={c.after.value} accent reduced={reduced} delay={0.12} />
              </div>
            </Reveal>
          ))}
        </div>

        {/* the scale it runs at */}
        <div className='mt-16 border-t border-border pt-10'>
          <p className='text-xs uppercase tracking-[0.2em] text-faint'>At the scale of</p>
          <div className='mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-3'>
            {SCALE.map((s) => (
              <Reveal as='div' key={s.label}>
                <div className='font-display text-4xl font-medium tracking-tight md:text-5xl'>
                  <CountUp value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
                </div>
                <div className='mt-2 text-xs uppercase tracking-wider text-faint'>{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
