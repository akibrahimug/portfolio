'use client'

import { useEffect, useState } from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Container } from '@/components/ui/Container'
import { TextLink } from '@/components/ui/TextLink'
import { cn } from '@/components/ui/cn'

export function SiteNav() {
  const { nav, cv } = redesignContent
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-border bg-background/85 backdrop-blur-md' : 'border-transparent',
      )}
    >
      <Container className='flex h-16 items-center justify-between gap-6'>
        <a href='#top' className='font-display text-lg tracking-tight'>
          {nav.brand}
        </a>
        <nav aria-label='Primary'>
          <ul className='hidden items-center gap-6 sm:flex'>
            {nav.links.map((l) => (
              <li key={l.href}>
                <TextLink href={l.href}>{l.label}</TextLink>
              </li>
            ))}
            <li>
              <TextLink href={cv.href} download>
                {cv.label}
              </TextLink>
            </li>
          </ul>
          <TextLink href={cv.href} download className='sm:hidden'>
            CV
          </TextLink>
        </nav>
      </Container>
    </header>
  )
}
