import type { ReactNode } from 'react'

/**
 * Full-bleed page band — the <section> that sits directly in <main>. Padding lives here so
 * content never sits flush on a section edge.
 */
export function Band({ children }: { children: ReactNode }) {
  return <section className='py-16 md:py-24'>{children}</section>
}
