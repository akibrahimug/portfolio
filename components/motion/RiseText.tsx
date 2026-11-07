import { Fragment, type CSSProperties, type ReactNode } from 'react'

export type RiseSegment = string | { readonly em: string }

/**
 * Hero entrance for a headline: each word rises out of its own mask, staggered.
 *
 * Pure CSS (`.rise-*` in globals.css) on server-rendered markup — no hydration step, so it
 * starts on first paint and can't strand hidden text. Reduced motion: the words simply stand.
 * The full sentence is exposed once via aria-label; the split words are aria-hidden.
 */
export function RiseText({
  segments,
  stagger = 45,
}: {
  segments: readonly RiseSegment[]
  stagger?: number
}) {
  let i = 0
  const words = (text: string) =>
    text
      .split(/\s+/)
      .filter(Boolean)
      .map((w, n, all) => {
        const index = i++
        return (
          <Fragment key={index}>
            <span className='rise-mask'>
              <span className='rise-word' style={{ '--rise-delay': `${index * stagger}ms` } as CSSProperties}>
                {w}
              </span>
            </span>
            {/* the space must sit outside the inline-block mask or it collapses */}
            {n < all.length - 1 ? ' ' : null}
          </Fragment>
        )
      })

  const nodes: ReactNode[] = segments.map((seg, s) => (
    <Fragment key={s}>
      {s > 0 ? ' ' : null}
      {typeof seg === 'string' ? words(seg) : <em>{words(seg.em)}</em>}
    </Fragment>
  ))
  const label = segments.map((seg) => (typeof seg === 'string' ? seg : seg.em)).join(' ')

  return (
    <>
      <span className='sr-only'>{label}</span>
      <span aria-hidden>{nodes}</span>
    </>
  )
}
