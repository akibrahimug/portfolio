import type { LeadFigure as Lead } from '@/lib/case-studies'
import { FigureText } from '@/components/ui/FigureText'
import { cn } from '@/components/ui/cn'

/**
 * A case study's one proving figure, set large, read as the start of its sentence:
 * "−60%  page load time on a platform read by 3.4M people a month…"
 */
export function LeadFigure({ lead, size = 'md', className }: { lead: Lead; size?: 'md' | 'lg'; className?: string }) {
  return (
    <p className={cn('grid items-center gap-x-5 gap-y-2 border-t border-border pt-5 sm:grid-cols-[auto_1fr]', className)}>
      <span
        className={cn(
          'whitespace-nowrap font-display leading-none tracking-tight text-accent',
          size === 'lg' ? 'text-display-xl' : 'text-display-lg',
        )}
      >
        {lead.value}
      </span>
      <span className={cn('text-pretty text-muted-foreground', size === 'lg' ? 'max-w-md text-lg' : 'max-w-xs text-base')}>
        <FigureText text={lead.sentence} />
      </span>
    </p>
  )
}
