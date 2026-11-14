import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { Heading, Text } from '@/components/ui/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Compound section. Compose only the parts a section needs:
 *
 *   <Section id='work'>
 *     <Section.Header>
 *       <Section.Title>…</Section.Title>
 *       <Section.Intro>…</Section.Intro>
 *     </Section.Header>
 *     <Section.Body>…</Section.Body>
 *   </Section>
 *
 * Server-safe: no context, no client hooks. Renders a <div> (the scroll target); the page wraps
 * it in a `Band`, which is the real <section> in <main>.
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
    // Anchor offset comes from the global scroll-padding-top (nav + ask bar); no per-section margin.
    <Container id={id} className={className}>
      {children}
    </Container>
  )
}

/** Centred heading block: the title says what the section is, so it carries no label or number. */
function Header({ children }: { children?: ReactNode }) {
  return <header className='mx-auto max-w-xl text-center'>{children}</header>
}

function Title({ children }: { children: ReactNode }) {
  return (
    <Heading level={2} size='lg'>
      {children}
    </Heading>
  )
}

function Intro({ children }: { children: ReactNode }) {
  return (
    <Text size='lead' className='mt-5'>
      {children}
    </Text>
  )
}

function Body({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mt-12 md:mt-14', className)}>{children}</div>
}

export const Section = Object.assign(Root, { Header, Title, Intro, Body })
