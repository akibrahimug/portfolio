'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function SelectedWork() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, items } = redesignContent.work

  return (
    <section id='work' className='border-b border-white/[0.05] py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500'>{eyebrow}</p>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-5xl'>
          {heading}
        </h2>

        <ul className='mt-14 divide-y divide-white/[0.05] border-y border-white/[0.05]'>
          {items.map((item, i) => (
            <motion.li
              key={item.slug}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={reduced ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className='group block py-7 transition-colors md:py-9'
              >
                <div className='grid gap-6 md:grid-cols-[6rem_1fr_auto] md:items-baseline md:gap-10'>
                  <span className='font-mono text-xs tracking-widest text-zinc-500'>
                    {item.year}
                  </span>
                  <div>
                    <h3 className='text-2xl font-medium tracking-tight text-zinc-100 transition-colors group-hover:text-brand-500 md:text-3xl'>
                      {item.title}
                    </h3>
                    <p className='mt-1 font-mono text-xs uppercase tracking-wider text-zinc-500'>
                      {item.role}
                    </p>
                    <p className='mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base'>
                      {item.summary}
                    </p>
                    <ul className='mt-4 flex flex-wrap gap-x-2 gap-y-2'>
                      {item.stack.map((s) => (
                        <li
                          key={s}
                          className='rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400'
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span
                    aria-hidden
                    className='hidden self-center text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-brand-500 md:inline'
                  >
                    →
                  </span>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        <div className='mt-12 text-center'>
          <a
            href='https://github.com/akibrahimug'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-100'
          >
            More on GitHub
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
