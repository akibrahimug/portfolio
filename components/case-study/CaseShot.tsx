import { ViewTransition } from 'react'
import Image from 'next/image'
import { cn } from '@/components/ui/cn'

/**
 * A project screenshot in a quiet frame. The shared `name` lets the same picture morph
 * between the case-study index and its detail page (React <ViewTransition>).
 */
export function CaseShot({
  slug,
  src,
  alt,
  priority = false,
  sizes,
  className,
}: {
  slug: string
  src: string
  alt: string
  priority?: boolean
  sizes: string
  className?: string
}) {
  return (
    <ViewTransition name={`case-shot-${slug}`}>
      <div className={cn('relative aspect-[16/10] overflow-hidden border border-border bg-muted', className)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className='object-cover object-top transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.025]'
        />
      </div>
    </ViewTransition>
  )
}
