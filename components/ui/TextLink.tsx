import type { ComponentPropsWithoutRef } from 'react'
import { cn } from './cn'

const styles = {
  /** Quiet nav/footer link: colour shift + underline on hover. */
  quiet:
    'text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline',
  /** Inline link inside a heading or sentence: the underline draws in accent. */
  inline:
    'underline decoration-border-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent',
  /** Small accent-on-hover action link. */
  action: 'text-sm text-muted-foreground transition-colors hover:text-accent',
} as const

/** Anchor with consistent styles; `external` adds target/rel. */
export function TextLink({
  variant = 'quiet',
  external = false,
  className,
  ...rest
}: { variant?: keyof typeof styles; external?: boolean } & ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      className={cn(styles[variant], className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    />
  )
}
