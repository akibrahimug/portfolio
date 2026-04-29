'use client'

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function TickerStrip() {
  const reduced = useReducedMotion()
  const items = redesignContent.ticker

  if (reduced) {
    return (
      <div className='border-y border-border bg-background py-5'>
        <ul className='mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 px-5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:px-8'>
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    )
  }

  const Row = (
    <ul className='flex shrink-0 items-center gap-10 px-5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground'>
      {items.map((t) => (
        <li key={t} className='flex items-center gap-10'>
          <span className='transition-colors duration-300 hover:text-foreground'>{t}</span>
          <span aria-hidden className='text-muted-foreground/30'>
            ◆
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className='relative overflow-hidden border-y border-border bg-background py-5'>
      <div className='flex' style={{ animation: 'ticker 50s linear infinite' }}>
        {Row}
        {Row}
        {Row}
        {Row}
      </div>
      <div className='pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent' />
    </div>
  )
}
