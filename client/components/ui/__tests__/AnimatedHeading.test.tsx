import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { AnimatedHeading } from '../AnimatedHeading'

describe('AnimatedHeading', () => {
  it('renders children', () => {
    render(<AnimatedHeading>hello-heading</AnimatedHeading>)
    expect(screen.getByText('hello-heading')).toBeInTheDocument()
  })

  it('renders as <h2> by default', () => {
    const { container } = render(<AnimatedHeading>x</AnimatedHeading>)
    expect(container.querySelector('h2')).not.toBeNull()
  })

  it('respects the `as` prop and renders <h1> when as="h1"', () => {
    const { container } = render(<AnimatedHeading as='h1'>x</AnimatedHeading>)
    expect(container.querySelector('h1')).not.toBeNull()
  })

  it('applies gradient class when gradient prop is set', () => {
    const { container } = render(<AnimatedHeading gradient>x</AnimatedHeading>)
    const h = container.querySelector('h2') as HTMLElement
    expect(h.className).toContain('bg-clip-text')
  })

  it('does not apply gradient class when gradient prop is not set', () => {
    const { container } = render(<AnimatedHeading>x</AnimatedHeading>)
    const h = container.querySelector('h2') as HTMLElement
    expect(h.className || '').not.toContain('bg-clip-text')
  })
})
