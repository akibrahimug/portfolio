'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'
import { useScramble } from './useScramble'

const FADE_UP = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export function Hero() {
  const reduced = useReducedMotion()
  const { eyebrow, name, rolePool, statement, status, location, primaryCta, avatarSrc, avatarAlt } =
    redesignContent.hero
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
      className='relative isolate overflow-hidden border-b border-border pt-28 pb-20 md:pt-36 md:pb-28'
    >
      {/* Soft radial accent — stronger in dark, lighter in light */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(239,68,68,0.05),transparent_60%)] dark:bg-[radial-gradient(80%_60%_at_50%_0%,rgba(239,68,68,0.14),transparent_60%)]'
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-[0.025] dark:opacity-[0.04] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px]'
      />

      <div className='mx-auto grid max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16'>
        <div>
          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.5, delay: 0.05 }}
            className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            {...FADE_UP}
            transition={{ duration: 0.55, delay: 0.1 }}
            className='mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-7xl'
          >
            {name}
          </motion.h1>

          <motion.div
            {...FADE_UP}
            transition={{ duration: 0.55, delay: 0.18 }}
            className='mt-2 text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl'
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
                    : 'text-foreground/70')
                }
              >
                {display}
              </span>
            </span>
          </motion.div>

          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.55, delay: 0.28 }}
            className='mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg'
          >
            {statement}
          </motion.p>

          <motion.div
            {...FADE_UP}
            transition={{ duration: 0.55, delay: 0.36 }}
            className='mt-10 flex flex-wrap items-center gap-3'
          >
            <a
              href={primaryCta.href}
              className='group inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90'
            >
              {primaryCta.label}
              <span aria-hidden className='transition-transform group-hover:translate-x-0.5'>
                →
              </span>
            </a>
            <a
              href='#work'
              className='group inline-flex items-center gap-2 rounded-md border border-border bg-card/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card'
            >
              See selected work
            </a>
            <span className='inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300'>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
              {status.label}
            </span>
          </motion.div>

          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.55, delay: 0.44 }}
            className='mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground'
          >
            ↳ {location}
          </motion.p>
        </div>

        {/* Avatar — natural aspect ratio, brush-stroke painterly look, NOT cropped to a circle */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className='relative mx-auto aspect-[400/480] w-full max-w-[26rem] lg:max-w-none'
        >
          {/* Glow card behind */}
          <div
            aria-hidden
            className='pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/15 via-transparent to-transparent blur-2xl dark:from-brand-500/25'
          />
          <Image
            src={avatarSrc}
            alt={avatarAlt}
            fill
            priority
            sizes='(max-width: 1024px) 60vw, 380px'
            style={{ objectFit: 'contain' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
