import type { ReactNode } from 'react'
import { cn } from '@/components/ui/cn'

/**
 * Full-bleed page band — the <section> that sits directly in <main>. `invert` flips the token
 * palette for everything inside. Padding lives here so content never sits flush on a ground change.
 */
export function Band({ invert = false, children }: { invert?: boolean; children: ReactNode }) {
  return (
    <section
      className={cn(
        invert ? 'feature-invert bg-background py-20 text-foreground md:py-32' : 'py-16 md:py-24',
      )}
    >
      {children}
    </section>
  )
}
