import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.RESEND_TO_EMAIL || 'kasomaibrahim@gmail.com'
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

type Body = { name?: unknown; email?: unknown; message?: unknown }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { name, email, message } = (req.body ?? {}) as Body
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing fields' })
  }
  const trimmed = message.trim()
  if (!email.includes('@') || !trimmed || trimmed.length > 2000) {
    return res.status(400).json({ error: 'Invalid input' })
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' })
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Portfolio: new message from ${name}`,
      text: `From: ${name} <${email}>\n\n${trimmed}`,
    })
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send' })
  }
}
