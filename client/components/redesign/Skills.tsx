'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function Skills() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, groups } = redesignContent.skills

  return (
    <section id='skills' className='border-b border-border py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
          {eyebrow}
        </p>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
          {heading}
        </h2>

        <ul className='mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3'>
          {groups.map((g, i) => (
            <motion.li
              key={g.label}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={reduced ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className='font-mono text-[11px] uppercase tracking-widest text-muted-foreground'>
                {g.label}
              </p>
              <ul className='mt-4 flex flex-wrap gap-2'>
                {g.items.map((it) => (
                  <li
                    key={it}
                    className='rounded-md border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground/85 transition-colors hover:border-brand-500/40 hover:text-brand-500'
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
