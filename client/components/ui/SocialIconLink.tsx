import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  href: string
  label: string
  icon: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

export function SocialIconLink({ href, label, icon, size = 'md', className }: Props) {
  const isInternal = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('/')
  const sizeCls = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <a
      href={href}
      aria-label={label}
      {...(!isInternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-white/80 text-gray-800 border border-gray-200/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 hover:bg-brand-500 hover:text-white hover:border-brand-500',
        sizeCls,
        className,
      )}
    >
      {icon}
    </a>
  )
}
