import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from './cn'

type Level = 1 | 2 | 3 | 4
type DisplaySize = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

const displaySize: Record<DisplaySize, string> = {
  xl: 'text-display-xl',
  lg: 'text-display-lg',
  md: 'text-display-md',
  sm: 'text-display-sm',
  xs: 'text-display-xs',
}

/** Display heading. Semantic level and visual size are independent. */
export function Heading({
  level = 2,
  size = 'lg',
  className,
  ...rest
}: { level?: Level; size?: DisplaySize } & ComponentPropsWithoutRef<'h2'>) {
  const Tag = `h${level}` as const
  return (
    <Tag
      className={cn('font-display font-medium text-balance', displaySize[size], className)}
      {...rest}
    />
  )
}

type Tone = 'default' | 'muted' | 'faint' | 'accent'
const tone: Record<Tone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  faint: 'text-faint',
  accent: 'text-accent',
}
const textSize = {
  sm: 'text-sm leading-relaxed',
  base: 'text-base leading-relaxed',
  lead: 'text-base leading-relaxed md:text-lg',
} as const

/** Body copy. */
export function Text({
  size = 'base',
  tone: t = 'muted',
  className,
  ...rest
}: { size?: keyof typeof textSize; tone?: Tone } & ComponentPropsWithoutRef<'p'>) {
  return <p className={cn('text-pretty', textSize[size], tone[t], className)} {...rest} />
}

/** Small uppercase label. Renders a <p> unless `as` is given. */
export function Eyebrow({
  as: Tag = 'p',
  className,
  children,
}: {
  as?: 'p' | 'span' | 'dt' | 'dd' | 'div'
  className?: string
  children: ReactNode
}) {
  return (
    <Tag className={cn('text-xs uppercase tracking-[0.2em] text-faint', className)}>{children}</Tag>
  )
}
