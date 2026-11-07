import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>()
  return { ...actual, useReducedMotion: () => true }
})

import { CaseStudies } from '@/components/sections/CaseStudies'
import { caseStudies, moreWork } from '@/lib/case-studies'
import { Experience } from '@/components/sections/Experience'
import { About } from '@/components/sections/About'
import { redesignContent } from '@/lib/redesign-content'

describe('sections render content from redesign-content.ts', () => {
  it('CaseStudies links every case study to its page, and lists the rest as more work', () => {
    render(<CaseStudies />)
    for (const c of caseStudies) {
      const link = screen.getByRole('link', { name: `Read the ${c.title} case study` })
      expect(link).toHaveAttribute('href', `/work/${c.slug}`)
    }
    for (const p of moreWork) expect(screen.getByRole('link', { name: p.title })).toHaveAttribute('href', p.live)
  })

  it('every case study and more-work project has a committed screenshot', async () => {
    const { existsSync } = await import('node:fs')
    for (const c of caseStudies) expect(existsSync(`public${c.image}`), c.image).toBe(true)
    for (const p of moreWork) expect(existsSync(`public/projects/${p.slug}.webp`), p.slug).toBe(true)
  })

  it('Experience renders each role', () => {
    render(<Experience />)
    const headings = screen.getAllByRole('heading')
    for (const role of redesignContent.experience.roles) {
      const match = headings.some(
        (h) =>
          h.textContent?.includes(role.company) &&
          (!role.title || h.textContent?.includes(role.title)),
      )
      expect(match).toBe(true)
    }
  })

  it('About renders the now/current items', () => {
    render(<About />)
    for (const item of redesignContent.currently.items) {
      expect(screen.getByText(item.k)).toBeInTheDocument()
    }
  })
})
