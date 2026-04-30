import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  id?: string
  as?: 'section' | 'header' | 'main' | 'div'
  gradient?: 'none' | 'subtle' | 'aurora'
  className?: string
  children: React.ReactNode
}

export function Section({ id, as: As = 'section', gradient = 'none', className, children }: Props) {
  return (
    <As
      id={id}
      className={cn(
        'relative py-16 md:py-24 px-4 md:px-10',
        gradient === 'subtle' && 'bg-gradient-to-b from-transparent via-white/5 to-transparent',
        gradient === 'aurora' &&
          "before:content-[''] before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top,_var(--color-brand-500)/12%,_transparent_60%)]",
        className,
      )}
    >
      {children}
    </As>
  )
}
