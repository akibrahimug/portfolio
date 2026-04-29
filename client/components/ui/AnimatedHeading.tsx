'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface AnimatedHeadingProps {
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
}: AnimatedHeadingProps) {
  const reducedMotion = useReducedMotion()
  const classes = cn(
    gradient && 'bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent',
    className,
  )

  if (fadeInOnView && !reducedMotion) {
    const MotionTag = motion[as]
    return (
      <MotionTag
        className={classes}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </MotionTag>
    )
  }

  const Tag = as as React.ElementType
  return <Tag className={classes}>{children}</Tag>
}

export default AnimatedHeading
