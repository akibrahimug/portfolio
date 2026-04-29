import * as React from 'react'
import { render, screen } from '@testing-library/react'

describe('Marquee', () => {
  afterEach(() => {
    jest.resetModules()
  })

  it('renders children once when reduced motion is requested', () => {
    jest.isolateModules(() => {
      jest.doMock('framer-motion', () => ({
        ...jest.requireActual('framer-motion'),
        useReducedMotion: () => true,
      }))
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Marquee } = require('../Marquee')
      render(
        <Marquee>
          <span data-testid='m-item'>item</span>
        </Marquee>,
      )
    })
    expect(screen.getAllByTestId('m-item')).toHaveLength(1)
  })

  it('renders children twice (duplicated track) by default', () => {
    jest.isolateModules(() => {
      jest.doMock('framer-motion', () => ({
        ...jest.requireActual('framer-motion'),
        useReducedMotion: () => false,
      }))
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Marquee } = require('../Marquee')
      render(
        <Marquee>
          <span data-testid='m-item-2'>item</span>
        </Marquee>,
      )
    })
    expect(screen.getAllByTestId('m-item-2')).toHaveLength(2)
  })
})
