'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function About() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, paragraphs, facts } = redesignContent.about

  return (
    <section id='about' className='border-b border-border py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
          {eyebrow}
        </p>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
          {heading}
        </h2>

        <div className='mt-14 grid gap-12 md:grid-cols-[18rem_1fr] md:gap-16'>
          <motion.dl
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className='grid grid-cols-1 gap-4 self-start rounded-xl border border-border bg-card/40 p-6'
          >
            {facts.map((f) => (
              <div key={f.k} className='flex flex-col'>
                <dt className='font-mono text-[10px] uppercase tracking-widest text-muted-foreground'>
                  {f.k}
                </dt>
                <dd className='mt-0.5 text-foreground'>{f.v}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className='space-y-5 text-base leading-relaxed text-foreground/85 md:text-lg'
          >
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
