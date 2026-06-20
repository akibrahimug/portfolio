'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Section, Reveal } from './primitives'

export function Experience() {
  const { experience } = redesignContent

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='experience' index='05' eyebrow='Experience' title={experience.heading}>
        <div className='space-y-px'>
          {experience.roles.map((role, i) => {
            const href = 'href' in role ? (role.href as string) : undefined
            return (
              <Reveal as='div' key={role.company} delay={i * 0.04}>
                <div className='grid gap-4 border-t border-border py-9 md:grid-cols-[12rem_1fr] md:gap-10'>
                  <div className='text-sm'>
                    <p className='text-faint'>{role.period}</p>
                    <p className='mt-1 text-muted-foreground'>{role.place}</p>
                  </div>
                  <div>
                    <h3 className='font-display text-xl font-medium tracking-tight md:text-2xl'>
                      {role.title}
                      <span className='text-muted-foreground'> — </span>
                      {href ? (
                        <a
                          href={href}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline decoration-border-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent'
                        >
                          {role.company}
                        </a>
                      ) : (
                        role.company
                      )}
                    </h3>
                    <ul className='mt-4 space-y-2.5'>
                      {role.bullets.map((b, j) => (
                        <li key={j} className='flex gap-3 text-sm leading-relaxed text-muted-foreground'>
                          <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-accent' aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <div className='mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2'>
          {experience.education.map((e) => (
            <div key={e.school}>
              <p className='text-xs uppercase tracking-wider text-faint'>{e.period}</p>
              <p className='mt-1 font-display text-base font-medium'>{e.school}</p>
              <p className='text-sm text-muted-foreground'>{e.course}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
