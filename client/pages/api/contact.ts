import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import {
  notificationEmail,
  acknowledgementEmail,
  EMAIL_LOGO_CID,
} from '@/lib/email-templates'
import { emailLogoBase64 } from '@/lib/email-logo'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.RESEND_TO_EMAIL || 'kasomaibrahim@gmail.com'
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

const logoAttachment = {
  filename: 'logo.png',
  content: emailLogoBase64,
  contentType: 'image/png',
  contentId: EMAIL_LOGO_CID,
}

type Body = { name?: unknown; email?: unknown; message?: unknown }

const MESSAGE_MAX = 300
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { name, email, message } = (req.body ?? {}) as Body
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please fill in name, email, and message.' })
  }
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedMessage = message.trim()

  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 80) {
    return res.status(400).json({ error: 'Name looks invalid.' })
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Email looks invalid.' })
  }
  if (!trimmedMessage || trimmedMessage.length < 5 || trimmedMessage.length > MESSAGE_MAX) {
    return res.status(400).json({ error: `Message must be 5–${MESSAGE_MAX} characters.` })
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured.' })
  }

  const fromHeader = `Kasoma Ibrahim <${FROM}>`

  try {
    const notify = notificationEmail({ name: trimmedName, email: trimmedEmail, message: trimmedMessage })
    await resend.emails.send({
      from: fromHeader,
      to: TO,
      replyTo: trimmedEmail,
      subject: notify.subject,
      html: notify.html,
      text: notify.text,
      attachments: [logoAttachment],
    })
  } catch {
    return res.status(500).json({ error: 'Could not send right now. Try again in a moment.' })
  }

  // Best-effort confirmation to the visitor — failure here doesn't fail the request.
  try {
    const ack = acknowledgementEmail({ name: trimmedName, message: trimmedMessage })
    await resend.emails.send({
      from: fromHeader,
      to: trimmedEmail,
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
      attachments: [logoAttachment],
    })
  } catch {
    /* swallow — primary notification already delivered */
  }

  return res.status(200).json({ ok: true })
}
