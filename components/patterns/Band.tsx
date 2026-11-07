import type { ReactNode } from 'react'
import { cn } from '@/components/ui/cn'

/** Full-bleed vertical band. `invert` flips the token palette for everything inside. */
export function Band({ invert = false, children }: { invert?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        invert ? 'feature-invert bg-background py-20 text-foreground md:py-32' : 'py-14 md:py-20',
      )}
    >
      {children}
    </div>
  )
}
