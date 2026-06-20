'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Section, Reveal } from './primitives'

export function Work() {
  const { work } = redesignContent

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='work' index='01' eyebrow='Selected work' title={work.heading}>
        <ul className='-mt-2'>
          {work.items.map((item, i) => {
            const { title, live } = item
            return (
            <Reveal as='li' key={item.slug} delay={i * 0.05}>
              <article className='group grid gap-4 border-t border-border py-9 md:grid-cols-[7rem_1fr] md:gap-10'>
                <div className='text-sm text-faint'>{item.year}</div>
                <div>
                  <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
                    <h3 className='font-display text-2xl font-medium tracking-tight md:text-3xl'>
                      {live ? (
                        <a
                          href={live}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent'
                        >
                          {title}
                        </a>
                      ) : (
                        title
                      )}
                    </h3>
                    {item.live && (
                      <a
                        href={item.live}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-muted-foreground transition-colors hover:text-accent'
                      >
                        Visit ↗
                      </a>
                    )}
                  </div>
                  <p className='mt-1 text-sm text-muted-foreground'>{item.role}</p>
                  <p className='mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground'>
                    {item.summary}
                  </p>
                  <p className='mt-5 flex items-center gap-3 text-sm font-medium text-accent'>
                    <span className='h-px w-6 bg-accent' aria-hidden />
                    {item.metric}
                  </p>
                  <ul className='mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-faint'>
                    {item.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
            )
          })}
        </ul>
      </Section>
    </div>
  )
}
