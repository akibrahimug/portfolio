'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { useCreateMessage } from '@/hooks/useHttpApi'

export function Connect() {
  const { eyebrow, heading, body, email, socials } = redesignContent.contact
  const [copied, setCopied] = React.useState(false)
  const createMessage = useCreateMessage()
  const [feedback, setFeedback] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = React.useState({ name: '', email: '', message: '' })

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
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback('sending')
    try {
      const result = await createMessage.mutate({
        name: form.name,
        email: form.email,
        message: form.message,
      })
      if (result) {
        setFeedback('sent')
        setForm({ name: '', email: '', message: '' })
      } else {
        setFeedback('error')
      }
    } catch {
      setFeedback('error')
    }
  }

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
          <form onSubmit={onSubmit} className='rounded-xl border border-border bg-card/40 p-6'>
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
                  placeholder='Your name'
                  className='w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500/40 focus:outline-none'
                />
              </label>
              <label className='block'>
                <span className='sr-only'>Email</span>
                <input
                  required
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={onChange}
                  placeholder='Email'
                  className='w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500/40 focus:outline-none'
                />
              </label>
              <label className='block'>
                <span className='sr-only'>Message</span>
                <textarea
                  required
                  rows={4}
                  maxLength={300}
                  name='message'
                  value={form.message}
                  onChange={onChange}
                  placeholder='Message (300 chars max)'
                  className='w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500/40 focus:outline-none'
                />
              </label>
            </div>
            <button
              type='submit'
              disabled={feedback === 'sending'}
              className='mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50'
            >
              {feedback === 'sending' ? 'Sending…' : 'Send message'}
              <span aria-hidden>→</span>
            </button>
            {feedback === 'sent' ? (
              <p className='mt-3 font-mono text-[11px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400'>
                ✓ Sent. I will reply within a day.
              </p>
            ) : null}
            {feedback === 'error' ? (
              <p className='mt-3 font-mono text-[11px] uppercase tracking-wider text-brand-500'>
                ✗ Could not send. Try email instead.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
