import React from 'react'
import { cn } from '@/lib/utils'

export interface SocialIconLinkProps {
  href: string
  label: string
  icon: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

const sizeClass: Record<NonNullable<SocialIconLinkProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
}

export function SocialIconLink({ href, label, icon, size = 'md', className }: SocialIconLinkProps) {
  const isInternal = href.startsWith('mailto:') || href.startsWith('tel:')
  const target = isInternal ? undefined : '_blank'
  const rel = isInternal ? undefined : 'noopener noreferrer'

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={label}
      className={cn(
        'group flex items-center justify-center rounded-full bg-white/80 text-gray-800 border border-gray-200/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 hover:bg-brand-500 hover:text-white hover:border-brand-500',
        sizeClass[size],
        className,
      )}
    >
      {icon}
    </a>
  )
}

export default SocialIconLink
