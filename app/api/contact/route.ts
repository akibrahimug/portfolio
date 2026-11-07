import { Resend } from 'resend'
import {
  notificationEmail,
  acknowledgementEmail,
  EMAIL_LOGO_CID,
} from '@/lib/email-templates'
import { emailLogoBase64 } from '@/lib/email-logo'

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

const json = (body: unknown, status = 200) => Response.json(body, { status })

export async function POST(req: Request) {
  const { name, email, message } = ((await req.json().catch(() => null)) ?? {}) as Body
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return json({ error: 'Please fill in name, email, and message.' }, 400)
  }
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedMessage = message.trim()

  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 80) {
    return json({ error: 'Name looks invalid.' }, 400)
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    return json({ error: 'Email looks invalid.' }, 400)
  }
  if (!trimmedMessage || trimmedMessage.length < 5 || trimmedMessage.length > MESSAGE_MAX) {
    return json({ error: `Message must be 5–${MESSAGE_MAX} characters.` }, 400)
  }
  if (!process.env.RESEND_API_KEY) {
    return json({ error: 'Email service not configured.' }, 500)
  }

  // Constructed per request: Resend throws without a key, and the key check above fails soft.
  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromHeader = `Ibrahim Kasoma <${FROM}>`

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
    return json({ error: 'Could not send right now. Try again in a moment.' }, 500)
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

  return json({ ok: true })
}
