'use client'

import * as React from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'
import { ThemeToggle } from './ThemeToggle'

export function TopNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300 ' +
        (scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-md'
          : 'border-b border-transparent')
      }
    >
      <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8'>
        <a
          href='#top'
          className='flex items-center gap-2 text-sm font-medium tracking-tight text-foreground hover:opacity-80'
        >
          <span className='inline-block h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' />
          {redesignContent.nav.brand}
        </a>
        <nav className='hidden items-center gap-1 md:flex'>
          {redesignContent.nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className='rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground'
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <a
            href={redesignContent.hero.primaryCta.href}
            className='group hidden items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand-500/40 hover:bg-brand-500/10 sm:inline-flex'
          >
            <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-400' />
            {redesignContent.hero.primaryCta.label}
            <span className='transition-transform group-hover:translate-x-0.5'>→</span>
          </a>
        </div>
      </div>
    </motion.header>
  )
}
