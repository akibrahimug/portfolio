import type { CaseMetric } from '@/lib/case-studies'
import { cn } from '@/components/ui/cn'

/** Headline figures for a case study. Labels are the terms, values the definitions. */
export function MetricRow({
  metrics,
  size = 'md',
  className,
}: {
  metrics: CaseMetric[]
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-5',
        size === 'md' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3',
        className,
      )}
    >
      {metrics.map((m) => (
        <div key={m.label} className='flex flex-col-reverse justify-end border-t border-border pt-3'>
          <dt className='mt-1 text-[11px] uppercase leading-snug tracking-wider text-faint'>{m.label}</dt>
          <dd className={cn('font-display tracking-tight', size === 'md' ? 'text-display-md' : 'text-2xl')}>
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
