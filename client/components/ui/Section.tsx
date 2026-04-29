import React from 'react'
import { cn } from '@/lib/utils'

export interface SectionProps {
  id?: string
  as?: 'section' | 'header' | 'main' | 'div'
  gradient?: 'none' | 'subtle' | 'aurora'
  className?: string
  children: React.ReactNode
}

const gradientClass: Record<NonNullable<SectionProps['gradient']>, string> = {
  none: '',
  subtle: 'bg-gradient-to-b from-transparent via-white/5 to-transparent',
  aurora:
    'relative before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_var(--color-brand-500)/15,_transparent_60%)]',
}

export function Section({
  id,
  as = 'section',
  gradient = 'none',
  className,
  children,
}: SectionProps) {
  const Tag = as as React.ElementType
  return (
    <Tag id={id} className={cn('py-16 md:py-24 px-4 md:px-10', gradientClass[gradient], className)}>
      {children}
    </Tag>
  )
}

export default Section
