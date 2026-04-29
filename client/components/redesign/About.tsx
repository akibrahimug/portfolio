'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function About() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, paragraphs, facts } = redesignContent.about

  return (
    <section id='about' className='border-b border-white/[0.05] py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500'>{eyebrow}</p>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-5xl'>
          {heading}
        </h2>

        <div className='mt-14 grid gap-12 md:grid-cols-[auto_1fr] md:gap-16'>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className='flex flex-col items-start gap-5'
          >
            <div className='relative h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-zinc-900 md:h-32 md:w-32'>
              <Image
                src='/icons/avarta.webp'
                alt='Kasoma Ibrahim'
                fill
                sizes='128px'
                className='object-cover'
              />
            </div>
            <dl className='grid grid-cols-1 gap-3 text-sm'>
              {facts.map((f) => (
                <div key={f.k} className='flex flex-col'>
                  <dt className='font-mono text-[10px] uppercase tracking-widest text-zinc-500'>
                    {f.k}
                  </dt>
                  <dd className='mt-0.5 text-zinc-200'>{f.v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className='space-y-5 text-base leading-relaxed text-zinc-300 md:text-lg'
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
