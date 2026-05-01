'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'

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

export function Connect() {
  const { eyebrow, heading, body, email, socials } = redesignContent.contact
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
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
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
    `w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${
      showError(field)
        ? 'border-brand-500/60 focus:border-brand-500'
        : 'border-border focus:border-brand-500/40'
    }`

  const submitDisabled = feedback === 'sending' || (submitAttempted && Object.keys(errors).length > 0)

  return (
    <section id='contact' className='py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
          {eyebrow}
        </p>
        <h2 className='mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
          {heading}
        </h2>
        <p className='mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
          {body}
        </p>

        <div className='mt-12 grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16'>
          {/* Email + socials */}
          <div>
            <div className='flex flex-col gap-3'>
              <a
                href={`mailto:${email}`}
                className='group inline-flex items-center gap-3 rounded-md border border-border bg-card/40 px-5 py-3 text-base font-medium text-foreground transition-all hover:border-brand-500/40 hover:bg-brand-500/10 md:text-lg'
              >
                <span className='font-mono break-all'>{email}</span>
                <span
                  aria-hidden
                  className='ml-auto transition-transform group-hover:translate-x-0.5'
                >
                  →
                </span>
              </a>
              <button
                type='button'
                onClick={onCopy}
                className='inline-flex w-fit items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground'
              >
                {copied ? '✓ Copied' : 'Copy email'}
              </button>
            </div>

            <ul className='mt-10 flex flex-wrap gap-x-6 gap-y-3'>
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group inline-flex items-center gap-1.5 font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'
                  >
                    <span className='transition-colors group-hover:text-brand-500'>{s.label}</span>
                    <span
                      aria-hidden
                      className='text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground'
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <form
            noValidate
            onSubmit={onSubmit}
            className='rounded-xl border border-border bg-card/40 p-6'
          >
            <p className='font-mono text-[11px] uppercase tracking-widest text-muted-foreground'>
              Or send a quick note
            </p>
            <div className='mt-5 space-y-3'>
              <label className='block'>
                <span className='sr-only'>Your name</span>
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
                {showError('name') ? (
                  <p
                    id='name-error'
                    className='mt-1.5 font-mono text-[11px] tracking-wide text-brand-500'
                  >
                    {showError('name')}
                  </p>
                ) : null}
              </label>
              <label className='block'>
                <span className='sr-only'>Email</span>
                <input
                  required
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder='Email'
                  aria-invalid={!!showError('email')}
                  aria-describedby={showError('email') ? 'email-error' : undefined}
                  className={fieldClass('email')}
                />
                {showError('email') ? (
                  <p
                    id='email-error'
                    className='mt-1.5 font-mono text-[11px] tracking-wide text-brand-500'
                  >
                    {showError('email')}
                  </p>
                ) : null}
              </label>
              <label className='block'>
                <span className='sr-only'>Message</span>
                <textarea
                  required
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  name='message'
                  value={form.message}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={`Message (${MESSAGE_MAX} chars max)`}
                  aria-invalid={!!showError('message')}
                  aria-describedby={showError('message') ? 'message-error' : undefined}
                  className={`${fieldClass('message')} resize-none`}
                />
                <div className='mt-1.5 flex items-start justify-between gap-2'>
                  <p
                    id='message-error'
                    className='font-mono text-[11px] tracking-wide text-brand-500'
                  >
                    {showError('message') ?? ' '}
                  </p>
                  <p
                    className={`font-mono text-[11px] tracking-wide ${
                      messageRemaining < 0
                        ? 'text-brand-500'
                        : messageRemaining < 30
                          ? 'text-foreground/60'
                          : 'text-muted-foreground/60'
                    }`}
                    aria-live='polite'
                  >
                    {messageRemaining}
                  </p>
                </div>
              </label>
            </div>
            <button
              type='submit'
              disabled={submitDisabled}
              className='mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {feedback === 'sending' ? 'Sending…' : 'Send message'}
              <span aria-hidden>→</span>
            </button>
            {feedback === 'sent' ? (
              <p
                role='status'
                className='mt-3 font-mono text-[11px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400'
              >
                ✓ Sent. I will reply within a day.
              </p>
            ) : null}
            {feedback === 'error' && serverError ? (
              <p
                role='alert'
                className='mt-3 font-mono text-[11px] uppercase tracking-wider text-brand-500'
              >
                ✗ {serverError}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
