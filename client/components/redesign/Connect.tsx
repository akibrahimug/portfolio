'use client'

import * as React from 'react'
import { redesignContent } from '@/lib/redesign-content'

export function Connect() {
  const { eyebrow, heading, body, email, socials } = redesignContent.connect
  const [copied, setCopied] = React.useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked — silent fail */
    }
  }

  return (
    <section id='connect' className='py-24 md:py-32'>
      <div className='mx-auto max-w-5xl px-5 md:px-8'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500'>{eyebrow}</p>
        <h2 className='mt-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-5xl'>
          {heading}
        </h2>
        <p className='mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg'>{body}</p>

        <div className='mt-10 flex flex-col gap-3 md:flex-row md:items-center'>
          <a
            href={`mailto:${email}`}
            className='group inline-flex items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-base font-medium text-zinc-100 transition-all hover:border-brand-500/40 hover:bg-brand-500/10 md:text-lg'
          >
            <span className='font-mono'>{email}</span>
            <span aria-hidden className='transition-transform group-hover:translate-x-0.5'>
              →
            </span>
          </a>
          <button
            type='button'
            onClick={onCopy}
            className='inline-flex items-center justify-center gap-2 rounded-md border border-white/[0.06] bg-transparent px-4 py-3 font-mono text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-zinc-100'
          >
            {copied ? '✓ Copied' : 'Copy email'}
          </button>
        </div>

        <ul className='mt-12 flex flex-wrap gap-x-6 gap-y-3'>
          {socials.map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target='_blank'
                rel='noopener noreferrer'
                className='group inline-flex items-center gap-1.5 font-mono text-sm uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-100'
              >
                <span className='transition-colors group-hover:text-brand-500'>{s.label}</span>
                <span
                  aria-hidden
                  className='text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-300'
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
