'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'

export function Footer() {
  const { footer, contact } = redesignContent
  return (
    <footer className='mt-24 border-t border-border'>
      <div className='mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-8'>
        <p>© 2026 Ibrahim Kasoma</p>
        <div className='flex items-center gap-6'>
          <a
            href={`mailto:${contact.email}`}
            className='underline-offset-4 transition-colors hover:text-foreground hover:underline'
          >
            Email
          </a>
          <a
            href={footer.repo}
            target='_blank'
            rel='noopener noreferrer'
            className='underline-offset-4 transition-colors hover:text-foreground hover:underline'
          >
            Source
          </a>
        </div>
      </div>
    </footer>
  )
}
