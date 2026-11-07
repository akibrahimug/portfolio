import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RiseText } from '@/components/motion/RiseText'

describe('RiseText', () => {
  const segments = ['Senior frontend engineer building', { em: 'AI-native' }, 'interfaces.'] as const

  it('keeps word spacing (spaces sit outside the inline-block masks)', () => {
    const { container } = render(<h1><RiseText segments={segments} /></h1>)
    const visual = container.querySelector('[aria-hidden]')!
    expect(visual.textContent).toBe('Senior frontend engineer building AI-native interfaces.')
    for (const mask of container.querySelectorAll('.rise-mask')) {
      expect(mask.textContent).not.toMatch(/\s/)
    }
  })

  it('exposes the sentence once to assistive tech and staggers each word', () => {
    const { container } = render(<h1><RiseText segments={segments} stagger={50} /></h1>)
    expect(container.querySelector('.sr-only')!.textContent).toBe(
      'Senior frontend engineer building AI-native interfaces.',
    )
    const words = [...container.querySelectorAll<HTMLElement>('.rise-word')]
    expect(words).toHaveLength(6)
    expect(words[4].style.getPropertyValue('--rise-delay')).toBe('200ms')
    expect(words[4].closest('em')).not.toBeNull()
  })
})
