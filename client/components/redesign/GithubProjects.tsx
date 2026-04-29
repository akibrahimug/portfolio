'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { redesignContent } from '@/lib/redesign-content'

type Repo = {
  id?: number
  name: string
  description: string | null
  html_url?: string
  href?: string
  language: string | null
  stargazers_count?: number
  stars?: number
  updated_at?: string
  updatedAt?: string
  fork?: boolean
}

const LANG_DOT: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  HTML: 'bg-orange-500',
  CSS: 'bg-pink-500',
  Python: 'bg-emerald-500',
  Go: 'bg-cyan-400',
  Rust: 'bg-amber-600',
  Shell: 'bg-zinc-400',
}

function fmtDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(+d)) return s
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function GithubProjects() {
  const reduced = useReducedMotion()
  const { eyebrow, heading, body, githubUser, fallback } = redesignContent.openSource
  const [repos, setRepos] = React.useState<Repo[] | null>(null)
  const [errored, setErrored] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    const ac = new AbortController()
    fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=24&type=public`, {
      signal: ac.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`GitHub responded ${r.status}`)
        return r.json() as Promise<Repo[]>
      })
      .then((data) => {
        if (!alive) return
        const filtered = data
          .filter((r) => !r.fork)
          .slice(0, 6)
          .map((r) => ({
            ...r,
            href: r.html_url,
            stars: r.stargazers_count ?? 0,
            updatedAt: r.updated_at,
          }))
        setRepos(filtered.length ? filtered : null)
      })
      .catch(() => {
        if (!alive) return
        setErrored(true)
      })
    return () => {
      alive = false
      ac.abort()
    }
  }, [githubUser])

  const displayed: Repo[] =
    repos ?? (fallback as unknown as Repo[]).map((r) => ({ ...r, href: r.href }))
  const isLive = !!repos && !errored

  return (
    <section id='open-source' className='border-b border-border py-24 md:py-32'>
      <div className='mx-auto max-w-6xl px-5 md:px-8'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
              {eyebrow}
            </p>
            <h2 className='mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl'>
              {heading}
            </h2>
            <p className='mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
              {body}
            </p>
          </div>
          <span
            className={
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ' +
              (isLive
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
                : 'border-border bg-card/40 text-muted-foreground')
            }
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                isLive ? 'bg-emerald-400' : 'bg-muted-foreground'
              }`}
            />
            {isLive ? 'Live · github.com/' + githubUser : 'Cached snapshot'}
          </span>
        </div>

        <ul className='mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {displayed.map((r, i) => (
            <motion.li
              key={r.id ?? r.name}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={reduced ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                href={r.href || r.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex h-full flex-col rounded-xl border border-border bg-card/40 p-5 transition-all hover:border-brand-500/40 hover:bg-brand-500/5'
              >
                <div className='flex items-start justify-between gap-3'>
                  <h3 className='font-mono text-sm font-medium tracking-tight text-foreground transition-colors group-hover:text-brand-500'>
                    {r.name}
                  </h3>
                  <span
                    aria-hidden
                    className='text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-500'
                  >
                    ↗
                  </span>
                </div>
                <p className='mt-2 line-clamp-3 text-sm text-muted-foreground'>
                  {r.description || 'No description.'}
                </p>
                <div className='mt-auto flex items-center gap-3 pt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground'>
                  {r.language ? (
                    <span className='inline-flex items-center gap-1.5'>
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          LANG_DOT[r.language] ?? 'bg-zinc-400'
                        }`}
                      />
                      {r.language}
                    </span>
                  ) : null}
                  {(r.stars ?? r.stargazers_count ?? 0) > 0 ? (
                    <span className='inline-flex items-center gap-1'>
                      ★ {r.stars ?? r.stargazers_count}
                    </span>
                  ) : null}
                  {r.updatedAt || r.updated_at ? (
                    <span className='ml-auto'>{fmtDate(r.updatedAt || r.updated_at)}</span>
                  ) : null}
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        <div className='mt-10 text-center'>
          <a
            href={`https://github.com/${githubUser}`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'
          >
            All repositories
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
