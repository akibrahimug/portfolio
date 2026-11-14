import type { ComponentPropsWithoutRef } from 'react'
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { cn } from './cn'

type ButtonVariant = 'primary' | 'outline'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-[transform,background-color,border-color,color,opacity] duration-200 motion-safe:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-foreground font-semibold text-background hover:bg-foreground/85',
  outline: 'border border-border-strong bg-background font-semibold text-foreground hover:border-foreground hover:bg-muted',
}

const buttonClass = (variant: ButtonVariant = 'primary', className?: string) =>
  cn(base, variants[variant], className)

const arrows = { right: ArrowRightIcon, down: ArrowDownIcon, out: ArrowUpRightIcon, left: ArrowLeftIcon } as const
const nudge = {
  right: 'motion-safe:group-hover:translate-x-0.5',
  down: 'motion-safe:group-hover:translate-y-0.5',
  out: 'motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5',
  left: 'motion-safe:group-hover:-translate-x-0.5',
} as const

/**
 * The site's one directional mark (Phosphor, bold): right = go on, down = on this page or a
 * download, out = leaves the site, left = back. Nudges on hover inside a `group` button or link.
 */
export function Arrow({ dir = 'right', className }: { dir?: keyof typeof arrows; className?: string }) {
  const Icon = arrows[dir]
  return (
    <Icon
      aria-hidden
      weight='bold'
      className={cn('size-[1.05em] shrink-0 transition-transform duration-200', nudge[dir], className)}
    />
  )
}

export function Button({
  variant,
  className,
  type = 'button',
  ...rest
}: { variant?: ButtonVariant } & ComponentPropsWithoutRef<'button'>) {
  return <button type={type} className={buttonClass(variant, cn('group', className))} {...rest} />
}

export function ButtonLink({
  variant,
  className,
  ...rest
}: { variant?: ButtonVariant } & ComponentPropsWithoutRef<'a'>) {
  return <a className={buttonClass(variant, cn('group', className))} {...rest} />
}
