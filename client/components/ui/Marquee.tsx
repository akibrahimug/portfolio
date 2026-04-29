import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  className?: string
  children: React.ReactNode
}

const SPEED_S: Record<NonNullable<Props['speed']>, number> = { slow: 80, normal: 40, fast: 20 }

export function Marquee({
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  className,
  children,
}: Props) {
  const reduced = useReducedMotion()
  if (reduced) {
    return <div className={cn('flex flex-wrap gap-4', className)}>{children}</div>
  }
  const animationName = direction === 'left' ? 'marquee' : 'marquee-reverse'
  return (
    <div
      className={cn(
        'relative flex overflow-hidden',
        pauseOnHover && 'hover:[animation-play-state:paused]',
        className,
      )}
    >
      <div
        className='flex shrink-0'
        style={{ animation: `${animationName} ${SPEED_S[speed]}s linear infinite` }}
      >
        {children}
      </div>
      <div
        className='flex shrink-0'
        style={{ animation: `${animationName} ${SPEED_S[speed]}s linear infinite` }}
        aria-hidden
      >
        {children}
      </div>
    </div>
  )
}
