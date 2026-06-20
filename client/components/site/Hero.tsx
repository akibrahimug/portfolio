'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { redesignContent } from '@/lib/redesign-content'
import { HeroGlobeMount } from './HeroGlobeMount'

const HERO_STATS = [
  { value: '6+', label: 'Years in production' },
  { value: '80+', label: 'Apps shipped' },
  { value: '7+', label: 'EF projects at once' },
]

export function Hero() {
  const { hero } = redesignContent
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <section id='top' className='mx-auto max-w-5xl px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-44'>
      <div className='grid items-center gap-12 md:grid-cols-[1.4fr_0.9fr] md:gap-10'>
        {/* text */}
        <div>
          <p className='flex items-center gap-2.5 text-sm text-muted-foreground'>
            <span className='inline-block h-1.5 w-1.5 rounded-full bg-accent' aria-hidden />
            {hero.status.label}
          </p>

          <h1 className='mt-6 font-display text-4xl font-medium leading-[1.04] tracking-tight text-balance sm:text-5xl md:text-6xl'>
            I build and scale the web platforms behind products millions of people use.
          </h1>

          <p className='mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg'>
            {hero.statement}
          </p>

          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <a
              href={hero.primaryCta.href}
              className='inline-flex cursor-pointer items-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90 hover:shadow-md'
            >
              {hero.primaryCta.label}
              <span aria-hidden>→</span>
            </a>
            <a
              href='#work'
              className='inline-flex cursor-pointer items-center gap-2 border border-border-strong px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent'
            >
              See selected work
              <span aria-hidden>→</span>
            </a>
          </div>

          <dl className='mt-14 grid max-w-xl grid-cols-3 divide-x divide-border border-t border-border'>
            {HERO_STATS.map((s) => (
              <div key={s.label} className='pt-8 first:pr-5 not-first:px-5'>
                <dt className='font-display text-3xl font-medium tracking-tight md:text-4xl'>
                  {s.value}
                </dt>
                <dd className='mt-2 text-[11px] uppercase leading-snug tracking-wider text-faint'>
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* dark mode → spinning tech globe; light mode → portrait */}
        {isDark ? (
          <HeroGlobeMount />
        ) : (
          <div className='order-first md:order-last md:-mt-90'>
            <div className='relative mx-auto aspect-4/5 w-56 sm:w-64 md:w-full'>
              <Image
                src={hero.avatarSrc}
                alt={hero.avatarAlt}
                fill
                priority
                sizes='(max-width: 768px) 16rem, 28rem'
                className='object-contain'
              />
            </div>
            <p className='mt-3 text-center text-xs uppercase tracking-wider text-faint md:text-left'>
              {hero.location}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
