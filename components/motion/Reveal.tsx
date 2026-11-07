'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE } from './ease'

type Tag = 'div' | 'section' | 'li' | 'article'

/**
 * A quiet block-level entrance on first scroll into view.
 *
 * Always renders the same element on server and client (no reduced-motion branch), so
 * hydration can't strand the SSR'd `opacity: 0`. Reduced motion and no-JS are handled in
 * CSS via `[data-reveal]` (globals.css + the <noscript> style in app/layout.tsx).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: Tag
}) {
  const MotionTag = motion[as] as typeof motion.div
  return (
    <MotionTag
      data-reveal=''
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
