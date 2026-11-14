import type { ReactNode } from 'react'
import { cn } from './cn'

/** Quiet dot bullet list for achievements and details. */
export function BulletList({ items, className }: { items: readonly ReactNode[]; className?: string }) {
  return (
    <ul className={cn('space-y-2.5', className)}>
      {items.map((item, i) => (
        <li key={i} className='flex gap-3 text-sm leading-relaxed text-muted-foreground'>
          <span className='mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong' aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Row of small pill tags (tech stack, categories). */
export function TagList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-1.5 text-xs text-muted-foreground', className)}>
      {items.map((t) => (
        <li key={t} className='rounded-full bg-muted px-2.5 py-1'>
          {t}
        </li>
      ))}
    </ul>
  )
}
