import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { Heading, Text } from '@/components/ui/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Compound section. Compose only the parts a section needs:
 *
 *   <Section id='work'>
 *     <Section.Header index='01' eyebrow='Selected work'>
 *       <Section.Title>…</Section.Title>
 *       <Section.Intro>…</Section.Intro>
 *     </Section.Header>
 *     <Section.Body>…</Section.Body>
 *   </Section>
 *
 * Server-safe: no context, no client hooks.
 */
function Root({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Container as='section' id={id} className={cn('scroll-mt-28', className)}>
      {children}
    </Container>
  )
}

function Header({
  index,
  eyebrow,
  children,
}: {
  index?: string
  eyebrow?: string
  children?: ReactNode
}) {
  return (
    <header>
      {(index || eyebrow) && (
        <div className='flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-faint'>
          {index && <span className='text-accent'>{index}</span>}
          {eyebrow && <span>{eyebrow}</span>}
          <span className='h-px flex-1 bg-border' aria-hidden />
        </div>
      )}
      {children}
    </header>
  )
}

function Title({ children }: { children: ReactNode }) {
  return (
    <Heading level={2} size='lg' className='mt-6 max-w-3xl'>
      {children}
    </Heading>
  )
}

function Intro({ children }: { children: ReactNode }) {
  return <Text className='mt-5 max-w-2xl'>{children}</Text>
}

function Body({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mt-12', className)}>{children}</div>
}

export const Section = Object.assign(Root, { Header, Title, Intro, Body })
