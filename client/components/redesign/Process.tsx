'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function Process() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, body, steps } = redesignContent.process

  return (
    <section id='process' className='border-b border-border py-24 md:py-32'>
      <div className='mx-auto max-w-6xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
          {eyebrow}
        </p>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
          {heading}
        </h2>
        <p className='mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
          {body}
        </p>

        <ol className='mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={reduced ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className='group relative h-full rounded-xl border border-border bg-card/40 p-6 transition-colors hover:border-brand-500/40'
            >
              <div className='flex items-baseline gap-3'>
                <span className='font-mono text-xs uppercase tracking-widest text-brand-500'>
                  {s.n}
                </span>
                <span className='h-px flex-1 bg-border transition-colors group-hover:bg-brand-500/40' />
              </div>
              <h3 className='mt-5 text-xl font-medium tracking-tight text-foreground'>{s.title}</h3>
              <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
