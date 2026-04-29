import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'

export function RedesignFooter() {
  return (
    <footer className='border-t border-border py-10'>
      <div className='mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:flex-row md:items-center md:px-8'>
        <span>{redesignContent.footer.line}</span>
        <a
          href={redesignContent.footer.repo}
          target='_blank'
          rel='noopener noreferrer'
          className='transition-colors hover:text-foreground'
        >
          Source ↗
        </a>
      </div>
    </footer>
  )
}
