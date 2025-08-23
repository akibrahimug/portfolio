'use client'

import type { ReactNode } from 'react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

interface AnimatedCardWrapperProps {
  children: ReactNode
  index?: number
  className?: string
}

export function AnimatedCardWrapper({ children, index = 0, className }: AnimatedCardWrapperProps) {
  const [isVisible, ref] = useIntersectionObserver()

  // Calculate staggered delay based on index
  const delay = index * 0.1 // 100ms between each card

  return (
    <div
      // @ts-ignore - ref type is compatible but TypeScript doesn't recognize it
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
      style={{
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
