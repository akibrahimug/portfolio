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
        glow && 'transition-all duration-500 hover:shadow-2xl',
        className,
      )}
    >
      {children}
    </As>
  )
}
