import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return { ...actual, useReducedMotion: () => true }
})

import { Contact } from '@/components/site/Contact'

const sendButton = () => screen.getByRole('button', { name: /send message/i })

describe('Contact form', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows inline validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.click(sendButton())
    expect(screen.getByText('Please tell me your name.')).toBeInTheDocument()
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Add a message.')).toBeInTheDocument()
  })

  it('flags an invalid email', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText(/you@company/i), 'nope')
    await user.click(sendButton())
    expect(screen.getByText(/doesn't look like a valid email/i)).toBeInTheDocument()
  })

  it('submits valid input and confirms success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText('Your name'), 'Jane Recruiter')
    await user.type(screen.getByPlaceholderText(/you@company/i), 'jane@example.com')
    await user.type(screen.getByPlaceholderText(/what would you like to build/i), 'Can we talk about a role?')
    await user.click(sendButton())

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.any(Object)))
    expect(await screen.findByRole('status')).toHaveTextContent(/reply within a day/i)
  })

  it('shows a server error on failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({ error: 'Email service not configured.' }) })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText('Your name'), 'Jane Recruiter')
    await user.type(screen.getByPlaceholderText(/you@company/i), 'jane@example.com')
    await user.type(screen.getByPlaceholderText(/what would you like to build/i), 'A valid message.')
    await user.click(sendButton())

    expect(await screen.findByText(/Email service not configured/i)).toBeInTheDocument()
  })
})
