'use client'

import React from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface MarqueeProps {
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  className?: string
  children: React.ReactNode
}

const speedSeconds: Record<NonNullable<MarqueeProps['speed']>, number> = {
  slow: 80,
  normal: 40,
  fast: 20,
}

export function Marquee({
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  className,
  children,
}: MarqueeProps) {
  const reducedMotion = useReducedMotion()
  const duration = speedSeconds[speed]
  const animationName = direction === 'right' ? 'marquee-reverse' : 'marquee'

  if (reducedMotion) {
    return <div className={cn('flex flex-wrap gap-4 w-full', className)}>{children}</div>
  }

  return (
    <div className={cn('relative flex overflow-hidden w-full', className)}>
      <div
        className={cn(
          'flex shrink-0 will-change-transform',
          pauseOnHover && 'hover:[animation-play-state:paused]',
        )}
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
          minWidth: '400%',
          width: 'max-content',
        }}
      >
        <div className='flex shrink-0'>{children}</div>
        <div aria-hidden className='flex shrink-0'>
          {children}
        </div>
        <div aria-hidden className='flex shrink-0'>
          {children}
        </div>
        <div aria-hidden className='flex shrink-0'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Marquee
