'use client'

import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/components/ui/cn'
import { EASE } from './ease'

/**
 * Horizontal bar that grows to `pct` when scrolled into view.
 * Hydration-safe like Reveal: reduced motion is handled in CSS via `[data-grow]` + `--pct`.
 */
export function GrowBar({
  pct,
  value,
  accent = false,
  delay = 0,
}: {
  pct: number
  value: string
  accent?: boolean
  delay?: number
}) {
  return (
    <div className='flex items-center gap-3'>
      <div className='relative h-2 flex-1 overflow-hidden bg-muted'>
        <motion.div
          className={cn('h-full', accent ? 'bg-accent' : 'bg-foreground/20')}
          data-grow=''
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE, delay }}
          style={{ '--pct': `${pct}%` } as CSSProperties}
        />
      </div>
      <span className='w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground'>
        {value}
      </span>
    </div>
  )
}
