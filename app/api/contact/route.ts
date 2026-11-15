import { Resend } from 'resend'
import {
  notificationEmail,
  acknowledgementEmail,
  EMAIL_LOGO_CID,
} from '@/lib/email-templates'
import { emailLogoBase64 } from '@/lib/email-logo'

const TO = process.env.RESEND_TO_EMAIL || 'kasomaibrahim@gmail.com'
/** Resend's shared sender: needs no verified domain, but only delivers to the account owner. */
const FALLBACK_FROM = 'onboarding@resend.dev'
const FROM = process.env.RESEND_FROM_EMAIL || FALLBACK_FROM

const logoAttachment = {
  filename: 'logo.jpg',
  content: emailLogoBase64,
  contentType: 'image/jpeg',
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
  const notify = notificationEmail({ name: trimmedName, email: trimmedEmail, message: trimmedMessage })

  // The SDK does not throw on an API failure (bad key, unverified domain): it resolves with
  // `{ error }`. Treating that as success is how the form once said "Sent" and delivered nothing.
  const sendNotification = (from: string) =>
    send(resend, {
      from: `Ibrahim Kasoma <${from}>`,
      to: TO,
      replyTo: trimmedEmail,
      subject: notify.subject,
      html: notify.html,
      text: notify.text,
      attachments: [logoAttachment],
    })

  let failure = await sendNotification(FROM)
  // A from-domain Resend has not verified is refused outright. Resend's own sender still
  // delivers to the account owner, so the message reaches the inbox while the domain is fixed.
  if (failure && FROM !== FALLBACK_FROM && /domain|verif/i.test(failure)) {
    console.error(`[contact] ${FROM} was refused (${failure}); retrying from ${FALLBACK_FROM}`)
    failure = await sendNotification(FALLBACK_FROM)
  }
  if (failure) {
    console.error(`[contact] notification not sent: ${failure}`)
    return json({ error: 'Could not send right now. Please email me instead.' }, 502)
  }

  // Best-effort confirmation to the visitor — failure here doesn't fail the request.
  const ack = acknowledgementEmail({ name: trimmedName, message: trimmedMessage })
  const ackFailure = await send(resend, {
    from: `Ibrahim Kasoma <${FROM}>`,
    to: trimmedEmail,
    // The from address is a sender, not a mailbox: without this a reply to the
    // acknowledgement goes nowhere, and the email tells the visitor they can reply.
    replyTo: TO,
    subject: ack.subject,
    html: ack.html,
    text: ack.text,
    attachments: [logoAttachment],
  })
  if (ackFailure) console.error(`[contact] acknowledgement not sent: ${ackFailure}`)

  return json({ ok: true })
}

/** Sends one email. Resolves with null on success, or the reason it was not sent. */
async function send(resend: Resend, email: Parameters<Resend['emails']['send']>[0]): Promise<string | null> {
  try {
    const { error } = await resend.emails.send(email)
    return error ? `${error.name}: ${error.message}` : null
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}
