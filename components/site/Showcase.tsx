'use client'

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'
import { Section, Reveal } from './primitives'

type Item = (typeof redesignContent.showcase.items)[number]

function ProjectCard({ item, i, reduced }: { item: Item; i: number; reduced: boolean | null }) {
  const ref = React.useRef<HTMLElement>(null)
  const { title, live } = item

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Reveal as='div' delay={(i % 2) * 0.06} className='h-full'>
      <article
        ref={ref}
        onMouseMove={onMove}
        className='group relative h-full overflow-hidden border border-border bg-card/30 p-6 transition-[transform,border-color] duration-300 hover:border-accent/60 motion-safe:hover:-translate-y-1 md:p-7'
      >
        {/* cursor-tracking red spotlight — only on the project cards */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          style={{
            background:
              'radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)',
          }}
        />
        {/* corner index that shifts on hover */}
        <span className='pointer-events-none absolute right-5 top-5 font-display text-sm text-faint transition-all duration-300 group-hover:text-accent md:right-7 md:top-7'>
          {String(i + 1).padStart(2, '0')}
        </span>

        <div className='relative flex h-full flex-col'>
          <span className='text-xs uppercase tracking-wider text-faint'>{item.kind}</span>
          <h3 className='mt-4 font-display text-xl font-medium tracking-tight transition-colors group-hover:text-accent'>
            {live ? (
              <a href={live} target='_blank' rel='noopener noreferrer' className='before:absolute before:inset-0'>
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          <p className='mt-3 text-pretty text-sm leading-relaxed text-muted-foreground'>
            {item.summary}
          </p>
          <div className='mt-auto pt-5'>
            <ul className='flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-faint'>
              {item.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className='mt-4 flex items-center gap-4 text-sm'>
              {live && (
                <span className='font-medium text-foreground transition-colors group-hover:text-accent'>
                  Live ↗
                </span>
              )}
              {item.repo && (
                <a
                  href={item.repo}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative z-10 text-muted-foreground transition-colors hover:text-foreground'
                >
                  Code
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export function Showcase() {
  const { showcase } = redesignContent
  const reduced = useReducedMotion()

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='showcase' index='03' eyebrow='Projects' title={showcase.heading} intro={showcase.body}>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {showcase.items.map((item, i) => (
            <ProjectCard key={item.slug} item={item} i={i} reduced={reduced} />
          ))}
        </div>
      </Section>
    </div>
  )
}
