import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  glow?: boolean
  className?: string
  as?: 'div' | 'article'
  children: React.ReactNode
}

export function GradientCard({ glow = false, className, as: As = 'div', children }: Props) {
  return (
    <As
      className={cn(
        'group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white rounded-2xl',
        glow &&
          'transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/20 hover:border-brand-300/30',
        className,
      )}
    >
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />
      {children}
    </As>
  )
}
