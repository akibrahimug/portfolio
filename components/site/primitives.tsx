import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

/* -------------------------------------------------------------------------- */
/*  CountUp — numbers settle to value when scrolled into view                 */
/* -------------------------------------------------------------------------- */
export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  durationMs = 1100,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  durationMs?: number
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced || !inView) {
      setDisplay(value)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - t0) / durationMs, 1)
      setDisplay(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, value, durationMs])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Reveal — a quiet entrance. Used on blocks, never per-line.                */
/* -------------------------------------------------------------------------- */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] as typeof motion.div
  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  )
}

/* -------------------------------------------------------------------------- */
/*  Section — eyebrow + serif heading + optional intro, generous whitespace.  */
/* -------------------------------------------------------------------------- */
export function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  className = '',
}: {
  id?: string
  index?: string
  eyebrow?: string
  title?: React.ReactNode
  intro?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`scroll-mt-28 ${className}`}>
      {(eyebrow || index) && (
        <div className='flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-faint'>
          {index && <span className='text-accent'>{index}</span>}
          {eyebrow && <span>{eyebrow}</span>}
          <span className='h-px flex-1 bg-border' />
        </div>
      )}
      {title && (
        <h2 className='mt-6 max-w-3xl font-display text-3xl font-medium leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-5xl'>
          {title}
        </h2>
      )}
      {intro && (
        <p className='mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground'>
          {intro}
        </p>
      )}
      <div className={title || eyebrow ? 'mt-12' : ''}>{children}</div>
    </section>
  )
}
