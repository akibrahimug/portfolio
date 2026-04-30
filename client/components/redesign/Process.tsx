'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function Process() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, body, steps } = redesignContent.process
  const [openIdx, setOpenIdx] = React.useState<number | null>(null)

  const toggle = (i: number) => setOpenIdx((curr) => (curr === i ? null : i))

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
          {steps.map((s, i) => {
            const isOpen = openIdx === i
            return (
              <motion.li
                key={s.n}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={reduced ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className={
                  'group relative h-full overflow-hidden rounded-xl border bg-card/40 transition-colors lg:col-span-1 ' +
                  (isOpen
                    ? 'border-brand-500/50 bg-brand-500/[0.04] lg:col-span-4'
                    : 'border-border hover:border-brand-500/40')
                }
              >
                <button
                  type='button'
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`process-detail-${s.n}`}
                  className='flex w-full flex-col items-start gap-0 p-6 text-left'
                >
                  <div className='flex w-full items-baseline gap-3'>
                    <span className='font-mono text-xs uppercase tracking-widest text-brand-500'>
                      {s.n}
                    </span>
                    <span
                      className={
                        'h-px flex-1 transition-colors ' +
                        (isOpen ? 'bg-brand-500/40' : 'bg-border group-hover:bg-brand-500/40')
                      }
                    />
                    <span
                      aria-hidden
                      className={
                        'inline-flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] transition-all ' +
                        (isOpen
                          ? 'rotate-45 border-brand-500/40 text-brand-500'
                          : 'border-border text-muted-foreground group-hover:border-brand-500/40 group-hover:text-brand-500')
                      }
                    >
                      +
                    </span>
                  </div>
                  <h3 className='mt-5 text-xl font-medium tracking-tight text-foreground'>
                    {s.title}
                  </h3>
                  <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>{s.body}</p>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`process-detail-${s.n}`}
                      key='detail'
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={reduced ? false : { height: 'auto', opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className='overflow-hidden'
                    >
                      <div className='px-6 pb-6'>
                        <div className='border-t border-border pt-5'>
                          <p className='font-mono text-[10px] uppercase tracking-widest text-muted-foreground'>
                            How I think about it
                          </p>
                          <ul className='mt-4 space-y-3 text-sm leading-relaxed text-foreground/85 md:text-[15px]'>
                            {s.details.map((d, j) => (
                              <li key={j} className='flex gap-3'>
                                <span
                                  aria-hidden
                                  className='mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-brand-500/70'
                                />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
