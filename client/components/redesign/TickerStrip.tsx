'use client'

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

export function TickerStrip() {
  const reduced = useReducedMotion()
  const items = redesignContent.ticker

  if (reduced) {
    return (
      <div className='border-y border-white/[0.05] bg-zinc-950/60 py-5'>
        <ul className='mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 px-5 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 md:px-8'>
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    )
  }

  const Row = (
    <ul className='flex shrink-0 items-center gap-10 px-5 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500'>
      {items.map((t) => (
        <li key={t} className='flex items-center gap-10'>
          <span className='transition-colors duration-300 hover:text-zinc-200'>{t}</span>
          <span aria-hidden className='text-zinc-700'>
            ◆
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className='relative overflow-hidden border-y border-white/[0.05] bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-zinc-950 py-5'>
      <div className='flex' style={{ animation: 'ticker 50s linear infinite' }}>
        {Row}
        {Row}
        {Row}
        {Row}
      </div>
      {/* Edge gradient masks */}
      <div className='pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent' />
    </div>
  )
}
