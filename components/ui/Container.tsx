import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from './cn'

type ContainerProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

/** The page's one content column — equal left/right edges everywhere. */
export function Container<T extends ElementType = 'div'>({
  as,
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return <Tag className={cn('mx-auto w-full max-w-5xl px-5 md:px-8', className)} {...rest} />
}
