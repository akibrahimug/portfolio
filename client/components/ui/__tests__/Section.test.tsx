import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { Section } from '../Section'

describe('Section', () => {
  it('renders children', () => {
    render(
      <Section>
        <p>hello</p>
      </Section>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies the id attribute', () => {
    const { container } = render(<Section id='projects'>content</Section>)
    const sectionEl = container.querySelector('section')
    expect(sectionEl).not.toBeNull()
    expect(sectionEl).toHaveAttribute('id', 'projects')
  })

  it('applies subtle gradient class when gradient is "subtle"', () => {
    const { container } = render(<Section gradient='subtle'>content</Section>)
    const sectionEl = container.querySelector('section')
    expect(sectionEl?.className).toContain('bg-gradient-to-b')
  })

  it('renders as the given element', () => {
    const { container } = render(<Section as='header'>content</Section>)
    expect(container.querySelector('header')).not.toBeNull()
  })
})
