import type { ComponentPropsWithoutRef } from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'outline'

const base =
  'inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-sm transition-[transform,background-color,border-color,color,opacity] duration-200 motion-safe:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent font-semibold text-accent-foreground hover:opacity-90',
  outline: 'border border-border-strong font-medium text-foreground hover:border-accent hover:text-accent',
}

export const buttonClass = (variant: ButtonVariant = 'primary', className?: string) =>
  cn(base, variants[variant], className)

/** Trailing arrow that nudges on hover; place inside a `group` button or link. */
export function Arrow({ dir = 'right' }: { dir?: 'right' | 'down' | 'out' }) {
  const glyph = dir === 'down' ? '↓' : dir === 'out' ? '↗' : '→'
  return (
    <span
      aria-hidden
      className='transition-transform duration-200 motion-safe:group-hover:translate-x-0.5'
    >
      {glyph}
    </span>
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
