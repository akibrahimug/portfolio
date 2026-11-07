import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from './cn'

type ContainerProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

/**
 * The page's one content column (`.wrap`) — equal left/right edges everywhere.
 * The .wrap box *is* the content edge: 1248px max → 96px margins at 1440; 20px on a phone, 32px on a tablet.
 */
export function Container<T extends ElementType = 'div'>({
  as,
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return <Tag className={cn('wrap mx-auto w-[calc(100%-2.5rem)] max-w-[78rem] md:w-[calc(100%-4rem)]', className)} {...rest} />
}
