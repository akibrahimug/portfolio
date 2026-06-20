import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return { ...actual, useReducedMotion: () => true }
})

import { Work } from '@/components/site/Work'
import { Showcase } from '@/components/site/Showcase'
import { Experience } from '@/components/site/Experience'
import { About } from '@/components/site/About'
import { redesignContent } from '@/lib/redesign-content'

describe('sections render content from redesign-content.ts', () => {
  it('Work renders each selected-work title', () => {
    render(<Work />)
    for (const item of redesignContent.work.items) {
      expect(screen.getByRole('heading', { name: new RegExp(item.title.slice(0, 12), 'i') })).toBeInTheDocument()
    }
  })

  it('Showcase renders every project title', () => {
    render(<Showcase />)
    for (const item of redesignContent.showcase.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
    }
  })

  it('Experience renders each company', () => {
    render(<Experience />)
    for (const role of redesignContent.experience.roles) {
      expect(screen.getByRole('heading', { name: new RegExp(role.company) })).toBeInTheDocument()
    }
  })

  it('About renders the now/current items', () => {
    render(<About />)
    for (const item of redesignContent.currently.items) {
      expect(screen.getByText(item.k)).toBeInTheDocument()
    }
  })
})
