'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { Button, Arrow } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Typography'
import {
  CheckIcon,
  CopyIcon,
  DownloadSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from '@phosphor-icons/react/ssr'

const SOCIAL_ICON = { github: GithubLogoIcon, linkedin: LinkedinLogoIcon, twitter: XLogoIcon, x: XLogoIcon } as const

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
  const { contact, cv } = redesignContent
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
    `mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground placeholder:text-faint transition-colors ${
      showError(field) ? 'border-accent' : 'border-border-strong hover:border-foreground/60 focus:border-foreground'
    }`

  const submitDisabled = feedback === 'sending' || (submitAttempted && Object.keys(errors).length > 0)

  return (
    <Section id='contact'>
      {/* The close: an ink band, with the main action — the email itself — set large. */}
      <div className='rounded-3xl bg-foreground px-6 py-14 text-center text-background md:px-12 md:py-20 [&_:focus-visible]:outline-background'>
        <Heading level={2} size='lg'>
          {contact.heading}
        </Heading>
        <p className='mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-background/75 md:text-lg'>
          {contact.body}
        </p>
        <a
          href={`mailto:${email}`}
          className='mt-8 inline-block min-h-11 py-1 font-display text-[clamp(1.25rem,0.4rem+4vw,3.75rem)] leading-[1.1] tracking-[-0.035em] underline decoration-background/35 decoration-2 underline-offset-[0.16em] transition-colors hover:decoration-background'
        >
          {/* If it must wrap (very narrow screens), it wraps after the @, never mid-domain. */}
          {email.split('@')[0]}@<wbr />
          {email.split('@')[1]}
        </a>
        <ul className='mt-6 flex flex-wrap items-center justify-center gap-x-7'>
          <li>
            <button type='button' onClick={onCopy} className='group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-background/75 transition-colors hover:text-background'>
              {copied ? <CheckIcon aria-hidden weight='bold' className='size-4' /> : <CopyIcon aria-hidden weight='bold' className='size-4' />}
              {copied ? 'Copied' : 'Copy email'}
            </button>
          </li>
          <li>
            <a href={cv.href} download className='group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-background/75 transition-colors hover:text-background'>
              <DownloadSimpleIcon aria-hidden weight='bold' className='size-4' />
              {cv.label}
            </a>
          </li>
          {socials.map((s) => {
            const Logo = SOCIAL_ICON[s.key as keyof typeof SOCIAL_ICON]
            return (
              <li key={s.key}>
                <a href={s.href} target='_blank' rel='noopener noreferrer' className='group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-background/75 transition-colors hover:text-background'>
                  {Logo && <Logo aria-hidden weight='bold' className='size-4' />}
                  {s.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <div className='mx-auto mt-6 max-w-xl rounded-3xl bg-card p-6 text-left md:p-10'>
          <p className='text-pretty font-display text-display-sm'>
            Or leave a note here. It lands in the same inbox.
          </p>
          {/* form */}
          <form noValidate onSubmit={onSubmit} className='mt-6 space-y-5'>
            <label className='block'>
              <span className='text-sm font-semibold'>Name</span>
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
              <span className='text-sm font-semibold'>Email</span>
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
              <span className='flex items-baseline justify-between text-sm'>
                <span className='font-semibold'>Message</span>
                <span
                  aria-live='polite'
                  className={`text-xs tabular-nums ${messageRemaining < 0 ? 'text-accent' : 'text-faint'}`}
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
              <Button type='submit' disabled={submitDisabled}>
                {feedback === 'sending' ? 'Sending…' : 'Send message'}
                <Arrow />
              </Button>
              {feedback === 'sent' && (
                <p role='status' className='text-sm text-accent'>
                  Sent. I’ll reply within a day.
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
      </div>
    </Section>
  )
}
