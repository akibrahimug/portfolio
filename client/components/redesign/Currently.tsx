'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function Currently() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, asOf, items } = redesignContent.currently

  return (
    <section className='border-b border-border py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <div className='flex flex-wrap items-baseline justify-between gap-3'>
          <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
            {eyebrow}
          </p>
          <p className='font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70'>
            {asOf}
          </p>
        </div>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
          {heading}
        </h2>

        <ul className='mt-14 grid gap-6 md:grid-cols-2'>
          {items.map((it, i) => (
            <motion.li
              key={it.k}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={reduced ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className='group relative rounded-xl border border-border bg-card/40 p-6 transition-colors hover:border-brand-500/40'
            >
              <div className='flex items-baseline gap-3'>
                <span className='inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500' />
                <p className='font-mono text-[11px] uppercase tracking-widest text-muted-foreground'>
                  {it.k}
                </p>
              </div>
              <p className='mt-3 text-base leading-relaxed text-foreground/90 md:text-lg'>{it.v}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
