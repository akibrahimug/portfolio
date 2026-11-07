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
    send.mockReset().mockResolvedValue({ id: 'x' })
    vi.stubEnv('RESEND_API_KEY', 're_test')
  })
  afterEach(() => vi.unstubAllEnvs())

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
    send.mockResolvedValueOnce({ id: 'x' }).mockRejectedValueOnce(new Error('boom'))
    const res = await post(valid)
    expect(res.status).toBe(200)
  })
})
