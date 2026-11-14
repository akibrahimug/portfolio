import { Fragment } from 'react'

/** Figures in running text: 80+, 3.4M, 60+, −60%, 45 → 15, 15,000+, ~30%. */
const FIGURE = /([−~]?\d[\d,.]*(?:\s?→\s?\d[\d,.]*)?(?:%|M\+?|k\+?|\+)?)/g

/**
 * Sets each figure in a sentence bold and in ink, so numbers carry weight inside the
 * sentence they prove — instead of a strip of figures under it (a known model-page tell).
 */
export function FigureText({ text }: { text: string }) {
  const parts = text.split(FIGURE)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} data-figure className='whitespace-nowrap font-semibold text-foreground'>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
