'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Section } from './primitives'

const MESSAGE_MAX = 300
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Field = 'name' | 'email' | 'message'
type Errors = Partial<Record<Field, string>>

const validate = (form: { name: string; email: string; message: string }): Errors => {
  const errors: Errors = {}
  const name = form.name.trim()
  const email = form.email.trim()
  const message = form.message.trim()

  if (!name) errors.name = 'Please tell me your name.'
  else if (name.length < 2) errors.name = 'Name is too short.'
  else if (name.length > 80) errors.name = 'Name is too long.'

  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(email)) errors.email = "That doesn't look like a valid email."

  if (!message) errors.message = 'Add a message.'
  else if (message.length < 5) errors.message = 'A bit more, please.'
  else if (message.length > MESSAGE_MAX) errors.message = `Please keep it under ${MESSAGE_MAX} characters.`

  return errors
}

export function Contact() {
  const { contact } = redesignContent
  const { email, socials } = contact
  const [copied, setCopied] = React.useState(false)
  const [feedback, setFeedback] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = React.useState({ name: '', email: '', message: '' })
  const [touched, setTouched] = React.useState<Record<Field, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const [submitAttempted, setSubmitAttempted] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const errors = validate(form)
  const showError = (field: Field) =>
    (touched[field] || submitAttempted) && errors[field] ? errors[field] : null
  const messageRemaining = MESSAGE_MAX - form.message.length

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked */
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (feedback === 'error' || feedback === 'sent') setFeedback('idle')
    if (serverError) setServerError(null)
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitAttempted(true)
    if (Object.keys(errors).length > 0) return

    setFeedback('sending')
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      })
      if (res.ok) {
        setFeedback('sent')
        setForm({ name: '', email: '', message: '' })
        setTouched({ name: false, email: false, message: false })
        setSubmitAttempted(false)
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setServerError(data?.error ?? 'Could not send. Try email instead.')
        setFeedback('error')
      }
    } catch {
      setServerError('Network error. Try email instead.')
      setFeedback('error')
    }
  }

  const fieldClass = (field: Field) =>
    `w-full border-b bg-transparent py-2.5 text-base text-foreground placeholder:text-faint focus:outline-none transition-colors ${
      showError(field) ? 'border-accent' : 'border-border focus:border-accent'
    }`

  const submitDisabled = feedback === 'sending' || (submitAttempted && Object.keys(errors).length > 0)

  return (
    <div className='mx-auto max-w-5xl px-5 md:px-8'>
      <Section id='contact' index='08' eyebrow='Contact' title={contact.heading} intro={contact.body}>
        <div className='grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16'>
          {/* direct + socials */}
          <div>
            <a
              href={`mailto:${email}`}
              className='group inline-flex items-baseline gap-2 font-display text-2xl font-medium tracking-tight underline decoration-border-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent md:text-3xl'
            >
              {email}
            </a>
            <div className='mt-3'>
              <button
                type='button'
                onClick={onCopy}
                className='text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline'
              >
                {copied ? 'Copied' : 'Copy email'}
              </button>
            </div>

            <ul className='mt-10 flex flex-wrap gap-x-8 gap-y-3'>
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-muted-foreground transition-colors hover:text-accent'
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* form */}
          <form noValidate onSubmit={onSubmit} className='space-y-6'>
            <label className='block'>
              <span className='text-xs uppercase tracking-wider text-faint'>Name</span>
              <input
                required
                name='name'
                value={form.name}
                onChange={onChange}
                onBlur={onBlur}
                placeholder='Your name'
                aria-invalid={!!showError('name')}
                aria-describedby={showError('name') ? 'name-error' : undefined}
                className={fieldClass('name')}
              />
              {showError('name') && (
                <p id='name-error' className='mt-1.5 text-xs text-accent'>
                  {showError('name')}
                </p>
              )}
            </label>
            <label className='block'>
              <span className='text-xs uppercase tracking-wider text-faint'>Email</span>
              <input
                required
                type='email'
                name='email'
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder='you@company.com'
                aria-invalid={!!showError('email')}
                aria-describedby={showError('email') ? 'email-error' : undefined}
                className={fieldClass('email')}
              />
              {showError('email') && (
                <p id='email-error' className='mt-1.5 text-xs text-accent'>
                  {showError('email')}
                </p>
              )}
            </label>
            <label className='block'>
              <span className='flex items-baseline justify-between text-xs uppercase tracking-wider text-faint'>
                <span>Message</span>
                <span
                  aria-live='polite'
                  className={messageRemaining < 0 ? 'text-accent' : 'text-faint'}
                >
                  {messageRemaining}
                </span>
              </span>
              <textarea
                required
                rows={4}
                maxLength={MESSAGE_MAX}
                name='message'
                value={form.message}
                onChange={onChange}
                onBlur={onBlur}
                placeholder='What would you like to build?'
                aria-invalid={!!showError('message')}
                aria-describedby={showError('message') ? 'message-error' : undefined}
                className={`${fieldClass('message')} resize-none`}
              />
              {showError('message') && (
                <p id='message-error' className='mt-1.5 text-xs text-accent'>
                  {showError('message')}
                </p>
              )}
            </label>

            <div className='flex flex-wrap items-center gap-4'>
              <button
                type='submit'
                disabled={submitDisabled}
                className='inline-flex cursor-pointer items-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
              >
                {feedback === 'sending' ? 'Sending…' : 'Send message'}
                <span aria-hidden>→</span>
              </button>
              {feedback === 'sent' && (
                <p role='status' className='text-sm text-accent'>
                  Sent — I’ll reply within a day.
                </p>
              )}
              {feedback === 'error' && serverError && (
                <p role='alert' className='text-sm text-accent'>
                  {serverError}
                </p>
              )}
            </div>
          </form>
        </div>
      </Section>
    </div>
  )
}
