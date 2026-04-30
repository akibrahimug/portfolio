'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function Showcase() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, body, items } = redesignContent.showcase

  return (
    <section id='showcase' className='border-b border-border py-24 md:py-32'>
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

        <ul className='mt-14 grid gap-5 md:grid-cols-2'>
          {items.map((p, i) => {
            const onRepoClick = (e: React.MouseEvent | React.KeyboardEvent) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(p.repo, '_blank', 'noopener,noreferrer')
            }
            return (
              <motion.li
                key={p.slug}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={reduced ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href={p.live}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={`${p.title} — open live site`}
                  className='group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/40 p-6 transition-colors hover:border-brand-500/40 hover:bg-brand-500/[0.04]'
                >
                  <div
                    aria-hidden
                    className='pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(60%_60%_at_30%_0%,rgba(239,68,68,0.06),transparent_70%)]'
                  />

                  <div className='flex items-start justify-between gap-4'>
                    <span className='font-mono text-[10px] uppercase tracking-widest text-brand-500'>
                      {p.kind}
                    </span>
                    <span
                      aria-hidden
                      className='font-mono text-[10px] uppercase tracking-widest text-muted-foreground'
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className='mt-4 text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-brand-500'>
                    {p.title}
                  </h3>

                  <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
                    {p.summary}
                  </p>

                  <ul className='mt-5 flex flex-wrap gap-x-2 gap-y-2'>
                    {p.stack.map((s) => (
                      <li
                        key={s}
                        className='rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground'
                      >
                        {s}
                      </li>
                    ))}
                  </ul>

                  <div className='mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5'>
                    <span className='inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-background transition-opacity group-hover:opacity-90'>
                      Live site
                      <span
                        aria-hidden
                        className='transition-transform group-hover:translate-x-0.5'
                      >
                        ↗
                      </span>
                    </span>
                    <span
                      role='button'
                      tabIndex={0}
                      onClick={onRepoClick}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onRepoClick(e)
                      }}
                      className='inline-flex items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground transition-colors hover:border-brand-500/40 hover:text-brand-500'
                    >
                      Repo
                      <span aria-hidden>↗</span>
                    </span>
                    <span className='ml-auto truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80'>
                      {(p.live || '').replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </a>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
