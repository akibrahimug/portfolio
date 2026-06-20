'use client'

import * as React from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { redesignContent } from '@/lib/redesign-content'
import techData from '@/lib/technologies.json'
import { Section, Reveal } from './primitives'

type Tech = {
  name: string
  icon: string
  experience?: string
  description?: string
  confidenceLevel?: number
}

const all: Tech[] = (techData as { techStack: Tech[] }).techStack

/** Type size + weight scaled by depth of experience — the visual hierarchy IS the data. */
function tierClass(c?: number): string {
  if (typeof c !== 'number') return 'text-lg text-muted-foreground'
  if (c >= 90) return 'text-3xl font-medium text-foreground md:text-4xl'
  if (c >= 78) return 'text-2xl text-foreground/85 md:text-3xl'
  return 'text-lg text-muted-foreground md:text-xl'
}

export function Stack() {
  const { skills, tech } = redesignContent
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<Tech | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='skills' index='06' eyebrow='Stack' title={skills.heading}>
        {/* capabilities — spec-sheet rows */}
        <div>
          {skills.groups.map((g, i) => (
            <Reveal as='div' key={g.label} delay={i * 0.03}>
              <div className='grid gap-x-8 gap-y-3 border-t border-border py-6 md:grid-cols-[15rem_1fr]'>
                <h3 className='flex items-baseline gap-3 font-display text-lg font-medium tracking-tight'>
                  <span className='text-sm text-accent'>{String(i + 1).padStart(2, '0')}</span>
                  {g.label}
                </h3>
                <ul className='flex flex-wrap gap-2'>
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className='border border-border px-2.5 py-1 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:border-accent hover:text-foreground'
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* depth field — names scaled by experience */}
        <div className='mt-16 border-t border-border pt-10'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div className='max-w-xl'>
              <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>{tech.body}</p>
              <p className='mt-1 text-xs uppercase tracking-wider text-faint'>
                Scaled by depth · select any for detail
              </p>
            </div>
            <label className='block w-full sm:max-w-xs'>
              <span className='sr-only'>Search the stack</span>
              <input
                type='search'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search…'
                className='w-full border-b border-border bg-transparent py-2 text-sm focus:border-accent focus:outline-none'
              />
            </label>
          </div>

          <Dialog.Root open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
            {filtered.length === 0 ? (
              <p className='mt-10 text-sm text-muted-foreground'>No matches for “{query}”.</p>
            ) : (
              <ul className='mt-10 flex flex-wrap items-baseline gap-x-7 gap-y-3'>
                {filtered.map((t) => (
                  <li key={t.name}>
                    <button
                      type='button'
                      onClick={() => setSelected(t)}
                      className={`group font-display leading-none tracking-tight transition-colors hover:text-accent! ${tierClass(
                        t.confidenceLevel,
                      )}`}
                    >
                      <span className='border-b border-transparent pb-1 transition-colors group-hover:border-accent'>
                        {t.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Dialog.Portal>
              <Dialog.Overlay className='fixed inset-0 z-50 bg-background/70 backdrop-blur-sm' />
              <Dialog.Content
                className='fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border-strong bg-card p-6 shadow-2xl focus:outline-none'
                aria-describedby={selected?.description ? 'tech-desc' : undefined}
              >
                {selected && (
                  <>
                    <div className='flex items-start gap-3'>
                      <span className='relative h-9 w-9 shrink-0'>
                        <Image src={selected.icon} alt='' fill sizes='36px' />
                      </span>
                      <div className='min-w-0 flex-1'>
                        <Dialog.Title className='font-display text-lg font-medium'>
                          {selected.name}
                        </Dialog.Title>
                        {selected.experience && (
                          <p className='text-xs uppercase tracking-wider text-faint'>
                            {selected.experience}
                          </p>
                        )}
                      </div>
                      <Dialog.Close
                        aria-label='Close'
                        className='text-muted-foreground transition-colors hover:text-foreground'
                      >
                        ✕
                      </Dialog.Close>
                    </div>
                    {selected.description && (
                      <Dialog.Description
                        id='tech-desc'
                        className='mt-4 text-sm leading-relaxed text-muted-foreground'
                      >
                        {selected.description}
                      </Dialog.Description>
                    )}
                    {typeof selected.confidenceLevel === 'number' && (
                      <div className='mt-5'>
                        <div className='flex items-center justify-between text-xs uppercase tracking-wider text-faint'>
                          <span>Confidence</span>
                          <span>{selected.confidenceLevel}%</span>
                        </div>
                        <div className='mt-2 h-1 w-full bg-border'>
                          <div
                            className='h-full bg-accent'
                            style={{ width: `${selected.confidenceLevel}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </Section>
    </div>
  )
}
