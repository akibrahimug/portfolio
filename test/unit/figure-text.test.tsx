import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FigureText } from '@/components/ui/FigureText'
import { redesignContent } from '@/lib/redesign-content'

const figures = (text: string) => {
  const { container } = render(<p><FigureText text={text} /></p>)
  return { all: [...container.querySelectorAll('span.font-display')].map((s) => s.textContent), text: container.textContent }
}

describe('FigureText', () => {
  it('sets the figures of the hero sentence in the serif, words untouched', () => {
    const { all, text } = figures(redesignContent.hero.statement)
    expect(all).toEqual(['80+', '3.4M', '60+'])
    expect(text).toBe(redesignContent.hero.statement) // nothing added or lost
  })

  it.each([
    ['cut by −60% overall', ['−60%']],
    ['from 45 → 15 minutes', ['45 → 15']],
    ['retiring 15,000+ lines', ['15,000+']],
    ['up from ~30% to 85%', ['~30%', '85%']],
  ])('%s', (text, expected) => {
    expect(figures(text).all).toEqual(expected)
  })

  it('leaves sentences without figures alone', () => {
    expect(figures('Ibrahim builds AI-native interfaces.').all).toEqual([])
  })
})
