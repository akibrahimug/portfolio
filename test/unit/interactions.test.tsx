import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return { ...actual, useReducedMotion: () => true }
})

import { ThemeProvider } from '@/components/theme-provider'
import { SiteNav } from '@/components/site/SiteNav'
import { Stack } from '@/components/site/Stack'

describe('Theme toggle', () => {
  it('toggles the dark class on the document root', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider attribute='class' defaultTheme='light'>
        <SiteNav />
      </ThemeProvider>,
    )
    const toggle = await screen.findByRole('button', { name: /toggle color scheme/i })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    await user.click(toggle)
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
  })
})

describe('Stack tech dialog (headless Radix)', () => {
  it('opens an accessible dialog with the tech detail and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Stack />)

    await user.click(screen.getByRole('button', { name: /^react/i }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'React' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('filters the tech list by search', async () => {
    const user = userEvent.setup()
    render(<Stack />)
    await user.type(screen.getByPlaceholderText('Search…'), 'postgres')
    expect(screen.getByRole('button', { name: /postgresql/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^react/i })).not.toBeInTheDocument()
  })
})
