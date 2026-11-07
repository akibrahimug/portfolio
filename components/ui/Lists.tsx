import type { ReactNode } from 'react'
import { cn } from './cn'

/** Accent-dot bullet list for achievements and details. */
export function BulletList({ items, className }: { items: readonly ReactNode[]; className?: string }) {
  return (
    <ul className={cn('space-y-2.5', className)}>
      {items.map((item, i) => (
        <li key={i} className='flex gap-3 text-sm leading-relaxed text-muted-foreground'>
          <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-accent' aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Inline uppercase tag row (tech stack, categories). */
export function TagList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-faint', className)}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}
