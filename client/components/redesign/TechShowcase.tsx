'use client'

import * as React from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'
import techData from '@/lib/technologies.json'

type Tech = {
  name: string
  icon: string
  experience?: string
  description?: string
  confidenceLevel?: number
}

const all: Tech[] = (techData as { techStack: Tech[] }).techStack

export function TechShowcase() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, body } = redesignContent.tech
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<Tech | null>(null)

  const filtered = React.useMemo(() => {
    if (!query.trim()) return all
    const q = query.toLowerCase()
    return all.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q),
    )
  }, [query])

  // Marquee row reused twice for seamless loop. Reduced motion → static.
  const rowOne = filtered.slice(0, Math.ceil(filtered.length / 2))
  const rowTwo = filtered.slice(Math.ceil(filtered.length / 2))

  const Tile = (t: Tech) => (
    <button
      key={t.name}
      type='button'
      onClick={() => setSelected(t)}
      className='group flex shrink-0 items-center gap-2.5 rounded-md border border-border bg-card/40 px-3 py-2 text-sm text-foreground transition-colors hover:border-brand-500/40 hover:bg-brand-500/5'
      aria-label={`View ${t.name} details`}
    >
      <span className='relative inline-block h-5 w-5'>
        <Image src={t.icon} alt='' fill sizes='20px' />
      </span>
      <span className='font-mono text-xs uppercase tracking-wider'>{t.name}</span>
    </button>
  )

  return (
    <section id='tech' className='border-b border-border py-24 md:py-32'>
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

        <div className='mt-10'>
          <label className='block max-w-md'>
            <span className='sr-only'>Search the stack</span>
            <input
              type='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search the stack…'
              className='w-full rounded-md border border-border bg-card/40 px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500/40 focus:outline-none'
            />
          </label>
        </div>

        <div className='mt-8 space-y-4 overflow-hidden'>
          {!query ? (
            <>
              <div className='relative overflow-hidden'>
                <div
                  className='flex gap-3'
                  style={
                    reduced
                      ? undefined
                      : { animation: 'ticker 60s linear infinite', minWidth: '200%' }
                  }
                >
                  {[...rowOne, ...rowOne, ...rowOne].map((t, i) => (
                    <span key={`${t.name}-${i}`}>{Tile(t)}</span>
                  ))}
                </div>
                <div className='pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent' />
                <div className='pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent' />
              </div>
              <div className='relative overflow-hidden'>
                <div
                  className='flex gap-3'
                  style={
                    reduced
                      ? undefined
                      : { animation: 'ticker-reverse 70s linear infinite', minWidth: '200%' }
                  }
                >
                  {[...rowTwo, ...rowTwo, ...rowTwo].map((t, i) => (
                    <span key={`${t.name}-${i}`}>{Tile(t)}</span>
                  ))}
                </div>
                <div className='pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent' />
                <div className='pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent' />
              </div>
            </>
          ) : (
            <div className='flex flex-wrap gap-3'>
              {filtered.length === 0 ? (
                <p className='font-mono text-sm text-muted-foreground'>No matches.</p>
              ) : (
                filtered.map(Tile)
              )}
            </div>
          )}
        </div>

        {selected ? (
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='tech-detail-title'
            className='fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm md:items-center'
            onClick={() => setSelected(null)}
          >
            <div
              className='w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-start gap-3'>
                <div className='relative h-10 w-10 shrink-0'>
                  <Image src={selected.icon} alt='' fill sizes='40px' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 id='tech-detail-title' className='text-lg font-semibold text-foreground'>
                    {selected.name}
                  </h3>
                  {selected.experience ? (
                    <p className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground'>
                      {selected.experience}
                    </p>
                  ) : null}
                </div>
                <button
                  type='button'
                  onClick={() => setSelected(null)}
                  aria-label='Close'
                  className='rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground'
                >
                  ✕
                </button>
              </div>
              {selected.description ? (
                <p className='mt-4 text-sm leading-relaxed text-muted-foreground'>
                  {selected.description}
                </p>
              ) : null}
              {typeof selected.confidenceLevel === 'number' ? (
                <div className='mt-5'>
                  <div className='flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground'>
                    <span>Confidence</span>
                    <span>{selected.confidenceLevel}%</span>
                  </div>
                  <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border'>
                    <div
                      className='h-full bg-brand-500'
                      style={{ width: `${selected.confidenceLevel}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
