'use client'

import { useRef, type MouseEvent } from 'react'
import { useReducedMotion } from 'motion/react'
import type { redesignContent } from '@/lib/redesign-content'
import { Reveal } from '@/components/motion/Reveal'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { TagList } from '@/components/ui/Lists'

type Item = (typeof redesignContent.showcase.items)[number]

/** Project card with a cursor-tracking accent spotlight. Whole card links to `live`. */
export function ProjectCard({ item, index }: { item: Item; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { title, live } = item
  const repo = 'repo' in item ? item.repo : undefined

  // Transient pointer position goes straight to CSS vars — no React state, no re-render.
  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Reveal delay={(index % 2) * 0.06} className='h-full'>
      <article
        ref={ref}
        onMouseMove={onMove}
        className='group relative h-full overflow-hidden border border-border bg-card/30 p-6 transition-[transform,border-color] duration-300 hover:border-accent/60 motion-safe:hover:-translate-y-0.5 md:p-7'
      >
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          style={{
            background:
              'radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)',
          }}
        />
        <span className='pointer-events-none absolute right-5 top-5 font-display text-sm text-faint transition-colors duration-300 group-hover:text-accent md:right-7 md:top-7'>
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className='relative flex h-full flex-col'>
          <Eyebrow as='span' className='tracking-wider'>
            {item.kind}
          </Eyebrow>
          <Heading level={3} size='xs' className='mt-4 text-xl transition-colors group-hover:text-accent'>
            {live ? (
              <a href={live} target='_blank' rel='noopener noreferrer' className='before:absolute before:inset-0'>
                {title}
              </a>
            ) : (
              title
            )}
          </Heading>
          <Text size='sm' className='mt-3'>
            {item.summary}
          </Text>
          <div className='mt-auto pt-5'>
            <TagList items={item.stack} className='gap-x-3' />
            <div className='mt-4 flex items-center gap-4 text-sm'>
              {live && (
                <span className='font-medium text-foreground transition-colors group-hover:text-accent'>
                  Live ↗
                </span>
              )}
              {repo && (
                <a
                  href={repo}
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
