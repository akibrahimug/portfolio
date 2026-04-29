import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { SocialIconLink } from '../SocialIconLink'

describe('SocialIconLink', () => {
  it('sets aria-label', () => {
    render(<SocialIconLink href='https://example.com' label='Example' icon={<svg />} />)
    expect(screen.getByLabelText('Example')).toBeInTheDocument()
  })

  it('sets target=_blank and rel=noopener noreferrer for external https links', () => {
    render(<SocialIconLink href='https://example.com' label='Ext' icon={<svg />} />)
    const a = screen.getByLabelText('Ext') as HTMLAnchorElement
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('does not set target/rel for mailto: links', () => {
    render(<SocialIconLink href='mailto:foo@example.com' label='Mail' icon={<svg />} />)
    const a = screen.getByLabelText('Mail') as HTMLAnchorElement
    expect(a.getAttribute('target')).toBeNull()
    expect(a.getAttribute('rel')).toBeNull()
  })

  it('does not set target/rel for tel: links', () => {
    render(<SocialIconLink href='tel:+1000' label='Tel' icon={<svg />} />)
    const a = screen.getByLabelText('Tel') as HTMLAnchorElement
    expect(a.getAttribute('target')).toBeNull()
    expect(a.getAttribute('rel')).toBeNull()
  })

  it('applies sm size class when size="sm"', () => {
    render(<SocialIconLink href='https://x.io' label='S' icon={<svg />} size='sm' />)
    const a = screen.getByLabelText('S')
    expect(a.className).toContain('h-8')
  })
})
