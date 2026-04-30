import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  gradient?: boolean
  fadeInOnView?: boolean
  className?: string
  children: React.ReactNode
}

export function AnimatedHeading({
  as = 'h2',
  gradient = false,
  fadeInOnView = false,
  className,
  children,
}: Props) {
  const reduced = useReducedMotion()
  const cls = cn(
    gradient && 'bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent',
    className,
  )

  if (!fadeInOnView || reduced) {
    return React.createElement(as, { className: cls }, children)
  }

  const MotionTag = (motion as never)[as]
  return (
    <MotionTag
      className={cls}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
