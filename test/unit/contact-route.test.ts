import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const send = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

import { POST } from '@/app/api/contact/route'

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

const valid = { name: 'Jane Recruiter', email: 'jane@example.com', message: 'Can we talk?' }

describe('POST /api/contact', () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ data: { id: 'x' }, error: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('RESEND_API_KEY', 're_test')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('rejects malformed JSON with 400', async () => {
    const res = await post('not json')
    expect(res.status).toBe(400)
  })

  it('rejects an invalid email with 400', async () => {
    const res = await post({ ...valid, email: 'nope' })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Email looks invalid.' })
  })

  it('fails soft with 500 when the API key is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const res = await post(valid)
    expect(res.status).toBe(500)
    expect(send).not.toHaveBeenCalled()
  })

  it('sends the notification with replyTo set to the visitor, then an acknowledgement', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[0][0]).toMatchObject({ replyTo: 'jane@example.com' })
    expect(send.mock.calls[1][0]).toMatchObject({ to: 'jane@example.com' })
  })

  it('still succeeds if only the acknowledgement fails', async () => {
    send.mockResolvedValueOnce({ data: { id: 'x' }, error: null }).mockRejectedValueOnce(new Error('boom'))
    const res = await post(valid)
    expect(res.status).toBe(200)
  })

  it('reports a failure when Resend refuses the notification (the SDK resolves with an error, it does not throw)', async () => {
    send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'API key is invalid' } })
    const res = await post(valid)
    expect(res.status).toBe(502)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('retries from Resend’s own sender when the from-domain is not verified', async () => {
    vi.resetModules()
    vi.stubEnv('RESEND_FROM_EMAIL', 'hello@kasomaibrahim.dev')
    const { POST: fresh } = await import('@/app/api/contact/route')
    send
      .mockResolvedValueOnce({ data: null, error: { name: 'validation_error', message: 'The kasomaibrahim.dev domain is not verified.' } })
      .mockResolvedValue({ data: { id: 'x' }, error: null })
    const res = await fresh(
      new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(valid) }),
    )
    expect(res.status).toBe(200)
    expect(send.mock.calls[1][0]).toMatchObject({ from: 'Ibrahim Kasoma <onboarding@resend.dev>', replyTo: 'jane@example.com' })
  })
})
