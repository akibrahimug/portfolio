import React from 'react'
import { cn } from '@/lib/utils'

export interface GradientCardProps {
  glow?: boolean
  className?: string
  children: React.ReactNode
  as?: 'div' | 'article'
}

export function GradientCard({ glow = false, className, children, as = 'div' }: GradientCardProps) {
  const Tag = as as React.ElementType
  return (
    <Tag
      className={cn(
        'group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white rounded-2xl',
        glow &&
          'hover:shadow-2xl hover:shadow-brand-500/20 hover:border-brand-300/30 transition-all duration-500',
        className,
      )}
    >
      <div
        aria-hidden
        className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none'
      />
      {children}
    </Tag>
  )
}

export default GradientCard
