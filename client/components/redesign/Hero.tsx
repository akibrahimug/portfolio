'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'
import { useScramble } from './useScramble'

const FADE_UP = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export function Hero() {
  const reduced = useReducedMotion()
  const { eyebrow, name, rolePool, statement, status, primaryCta } = redesignContent.hero
  const [idx, setIdx] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const role = rolePool[idx]
  const display = useScramble(role, !reduced)
  const settling = display !== role
  const longest = React.useMemo(
    () => rolePool.reduce((a, b) => (a.length >= b.length ? a : b)),
    [rolePool],
  )

  React.useEffect(() => {
    if (reduced || paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % rolePool.length), 3200)
    return () => clearInterval(t)
  }, [reduced, paused, rolePool.length])

  return (
    <section
      id='top'
      className='relative isolate overflow-hidden border-b border-white/[0.05] pt-28 pb-24 md:pt-40 md:pb-36'
    >
      {/* Soft radial accent */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(239,68,68,0.12),transparent_60%)]'
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]'
      />

      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <motion.p
          {...FADE_UP}
          transition={{ duration: 0.5, delay: 0.05 }}
          className='font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500'
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          {...FADE_UP}
          transition={{ duration: 0.55, delay: 0.1 }}
          className='mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-100 sm:text-5xl md:text-7xl'
        >
          {name}
        </motion.h1>

        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.55, delay: 0.18 }}
          className='mt-2 text-2xl font-medium tracking-tight text-zinc-500 sm:text-3xl md:text-5xl'
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span className='relative inline-block max-w-full align-baseline'>
            <span aria-hidden className='invisible whitespace-nowrap'>
              {longest}
            </span>
            <span
              aria-live='polite'
              className={
                'absolute inset-0 whitespace-nowrap font-mono tabular-nums tracking-tight transition-colors duration-300 ' +
                (settling
                  ? 'text-brand-500 [text-shadow:0_0_18px_rgba(239,68,68,0.45)]'
                  : 'text-zinc-300')
              }
            >
              {display}
            </span>
          </span>
        </motion.div>

        <motion.p
          {...FADE_UP}
          transition={{ duration: 0.55, delay: 0.28 }}
          className='mt-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg'
        >
          {statement}
        </motion.p>

        <motion.div
          {...FADE_UP}
          transition={{ duration: 0.55, delay: 0.36 }}
          className='mt-10 flex flex-wrap items-center gap-4'
        >
          <a
            href={primaryCta.href}
            className='group inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white'
          >
            {primaryCta.label}
            <span aria-hidden className='transition-transform group-hover:translate-x-0.5'>
              →
            </span>
          </a>
          <a
            href='#work'
            className='group inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.05]'
          >
            See selected work
          </a>
          <span className='inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-300'>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
            {status.label}
          </span>
        </motion.div>
      </div>
    </section>
  )
}
