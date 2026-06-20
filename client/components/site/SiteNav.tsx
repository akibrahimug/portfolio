'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { redesignContent } from '@/lib/redesign-content'

function SunIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden>
      <circle cx='12' cy='12' r='4' />
      <path d='M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4' strokeLinecap='round' />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden>
      <path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z' strokeLinejoin='round' />
    </svg>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type='button'
      aria-label='Toggle color scheme'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='inline-flex items-center gap-2 border border-border px-2.5 py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent hover:text-foreground'
    >
      <span className='inline-flex h-3.5 w-3.5 items-center justify-center'>
        {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : null}
      </span>
      <span className='hidden sm:inline'>{mounted ? (isDark ? 'Light' : 'Dark') : '··'}</span>
    </button>
  )
}

export function SiteNav() {
  const { nav } = redesignContent
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-border bg-background/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className='mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-5 md:px-8'>
        <a href='#top' className='font-display text-lg font-medium tracking-tight'>
          {nav.brand}
        </a>
        <nav className='flex items-center gap-4 sm:gap-6'>
          <ul className='hidden items-center gap-6 sm:flex'>
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className='text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline'
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span className='hidden h-4 w-px bg-border sm:block' aria-hidden />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
