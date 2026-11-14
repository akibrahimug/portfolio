import { Fragment, type CSSProperties } from 'react'

/**
 * Hero entrance for a headline: each word rises out of its own mask, staggered.
 *
 * Pure CSS (`.rise-*` in globals.css) on server-rendered markup — no hydration step, so it
 * starts on first paint and can't strand hidden text. Reduced motion: the words simply stand.
 * The full sentence is exposed once to assistive tech; the split words are aria-hidden.
 */
export function RiseText({ text, stagger = 45 }: { text: string; stagger?: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <>
      <span className='sr-only'>{text}</span>
      <span aria-hidden>
        {words.map((w, index) => (
          <Fragment key={index}>
            <span className='rise-mask'>
              <span className='rise-word' style={{ '--rise-delay': `${index * stagger}ms` } as CSSProperties}>
                {w}
              </span>
            </span>
            {/* the space must sit outside the inline-block mask or it collapses */}
            {index < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </>
  )
}
