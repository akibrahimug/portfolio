'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Section, Reveal } from './primitives'

export function Process() {
  const { process } = redesignContent

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='process' index='04' eyebrow='How I work' title={process.heading} intro={process.body}>
        <div className='space-y-px'>
          {process.steps.map((step, i) => (
            <Reveal as='div' key={step.n} delay={i * 0.04}>
              <div className='grid gap-5 border-t border-border py-9 md:grid-cols-[1fr_1.4fr] md:gap-12'>
                <div className='flex items-baseline gap-4'>
                  <span className='font-display text-3xl font-semibold text-accent'>{step.n}</span>
                  <div>
                    <h3 className='font-display text-2xl font-medium tracking-tight'>{step.title}</h3>
                    <p className='mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground'>
                      {step.body}
                    </p>
                  </div>
                </div>
                <ul className='space-y-3 md:pt-1'>
                  {step.details.map((d, j) => (
                    <li key={j} className='flex gap-3 text-sm leading-relaxed text-muted-foreground'>
                      <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-accent' aria-hidden />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  )
}
