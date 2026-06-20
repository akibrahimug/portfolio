'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Section, Reveal } from './primitives'

export function About() {
  const { about, currently } = redesignContent

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='about' index='07' eyebrow='About' title={about.heading}>
        <div className='grid gap-12 md:grid-cols-[1.5fr_1fr] md:gap-16'>
          <div className='space-y-5'>
            {about.paragraphs.map((p, i) => (
              <p key={i} className='text-pretty text-base leading-relaxed text-muted-foreground md:text-lg'>
                {p}
              </p>
            ))}
          </div>

          <Reveal as='div'>
            <p className='text-xs uppercase tracking-[0.2em] text-faint'>
              Now · {currently.asOf}
            </p>
            <dl className='mt-5 space-y-5'>
              {currently.items.map((item) => (
                <div key={item.k} className='border-t border-border pt-4'>
                  <dt className='font-display text-sm font-medium'>{item.k}</dt>
                  <dd className='mt-1 text-sm leading-relaxed text-muted-foreground'>{item.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>
    </div>
  )
}
