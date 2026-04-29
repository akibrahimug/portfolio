import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { GradientCard } from '../GradientCard'

describe('GradientCard', () => {
  it('renders children', () => {
    render(
      <GradientCard>
        <span>card-content</span>
      </GradientCard>,
    )
    expect(screen.getByText('card-content')).toBeInTheDocument()
  })

  it('applies glow class when glow prop is set', () => {
    const { container } = render(<GradientCard glow>x</GradientCard>)
    const div = container.firstElementChild as HTMLElement
    expect(div.className).toContain('hover:shadow-2xl')
  })

  it('does not apply glow class when glow prop is not set', () => {
    const { container } = render(<GradientCard>x</GradientCard>)
    const div = container.firstElementChild as HTMLElement
    expect(div.className).not.toContain('hover:shadow-2xl')
  })

  it('renders as the given element when as="article"', () => {
    const { container } = render(<GradientCard as='article'>x</GradientCard>)
    expect(container.querySelector('article')).not.toBeNull()
  })
})
