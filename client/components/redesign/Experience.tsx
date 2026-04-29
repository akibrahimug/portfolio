'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function Experience() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, roles, education } = redesignContent.experience

  return (
    <section id='experience' className='border-b border-border py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
          {eyebrow}
        </p>
        <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
          {heading}
        </h2>

        <ol className='mt-14 space-y-12 md:space-y-16'>
          {roles.map((r, i) => (
            <motion.li
              key={`${r.company}-${r.period}`}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={reduced ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className='grid gap-4 md:grid-cols-[12rem_1fr] md:gap-10'
            >
              <div className='font-mono text-xs uppercase tracking-widest text-muted-foreground'>
                <div className='text-foreground/80'>{r.period}</div>
                <div className='mt-1 text-muted-foreground/80'>{r.place}</div>
              </div>
              <div>
                <h3 className='text-xl font-medium tracking-tight text-foreground md:text-2xl'>
                  {r.title} <span className='text-muted-foreground'>·</span>{' '}
                  {'href' in r && r.href ? (
                    <a
                      href={r.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-brand-500 underline-offset-4 hover:underline'
                    >
                      {r.company}
                    </a>
                  ) : (
                    <span className='text-foreground/90'>{r.company}</span>
                  )}
                </h3>
                <ul className='mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
                  {r.bullets.map((b, j) => (
                    <li key={j} className='flex gap-3'>
                      <span
                        aria-hidden
                        className='mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-brand-500/70'
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className='mt-16 grid gap-6 border-t border-border pt-10 md:grid-cols-[12rem_1fr] md:gap-10'>
          <p className='font-mono text-xs uppercase tracking-widest text-muted-foreground'>
            Education
          </p>
          <ul className='space-y-3 text-sm md:text-base'>
            {education.map((e) => (
              <li key={e.school} className='flex flex-col md:flex-row md:items-baseline md:gap-3'>
                <span className='text-foreground/90'>{e.school}</span>
                <span className='text-muted-foreground'>— {e.course}</span>
                <span className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70 md:ml-auto'>
                  {e.period}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
