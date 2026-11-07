'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Ink, ProtectZone } from './ink-gl'

type Props = {
  src: string
  width: number
  height: number
  alt: string
  /** Region of the image (e.g. the face) the ink should leave nearly still. */
  protect?: ProtectZone
  className?: string
}

/**
 * The hero portrait as wet ink: pointer or touch disturbs the brush strokes, which bleed and
 * dry back. Progressive enhancement over a normal priority <Image> (the LCP element and the
 * fallback): WebGL loads after idle, reuses the already-decoded image, and swaps in only once
 * its dry frame matches the image exactly. Skipped under reduced motion or without WebGL.
 */
export function InkPortrait({ src, width, height, alt, protect, className }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!box || !canvas || !img) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let ink: Ink | null = null
    let cancelled = false
    const cleanups: Array<() => void> = []

    const start = async () => {
      if (!img.complete || !img.naturalWidth) {
        await new Promise<void>((resolve) => img.addEventListener('load', () => resolve(), { once: true }))
      }
      // Same URL the <img> already decoded (next/image's optimised variant) — no second download.
      const source = new window.Image()
      source.src = img.currentSrc || img.src
      await source.decode().catch(() => undefined)
      if (cancelled || !source.naturalWidth) return

      const { createInk } = await import('./ink-gl')
      if (cancelled) return
      ink = createInk(canvas, source, {
        protect,
        onReady: () => setLive(true),
        onLost: () => setLive(false),
      })
      if (!ink) return
      const current = ink

      const toBox = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        current.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
      }
      const leave = () => current.pointerLeave()
      box.addEventListener('pointermove', toBox, { passive: true })
      box.addEventListener('pointerdown', toBox, { passive: true })
      box.addEventListener('pointerleave', leave, { passive: true })
      cleanups.push(() => {
        box.removeEventListener('pointermove', toBox)
        box.removeEventListener('pointerdown', toBox)
        box.removeEventListener('pointerleave', leave)
      })

      const ro = new ResizeObserver(() => current.resize())
      ro.observe(canvas)
      cleanups.push(() => ro.disconnect())

      // Pause offscreen; the first time it's seen, one brush swipe hints it's alive.
      let swiped = false
      const io = new IntersectionObserver(([entry]) => {
        current.setVisible(entry.isIntersecting)
        if (entry.isIntersecting && !swiped) {
          swiped = true
          setTimeout(() => current.swipe(), 900)
        }
      })
      io.observe(box)
      cleanups.push(() => io.disconnect())
    }

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const handle = idle(() => void start())

    return () => {
      cancelled = true
      cancelIdle(handle as number)
      cleanups.forEach((fn) => fn())
      ink?.destroy()
      setLive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- protect is static content
  }, [src])

  return (
    <div ref={boxRef} className={className} style={{ touchAction: 'pan-y' }} data-ink={live ? 'live' : 'static'}>
      <Image
        ref={imgRef}
        src={src}
        width={width}
        height={height}
        alt={alt}
        priority
        sizes='(max-width: 768px) 16rem, 28rem'
        className='absolute inset-0 h-full w-full object-contain data-[hidden=true]:opacity-0'
        data-hidden={live}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className='pointer-events-none absolute inset-0 h-full w-full opacity-0 data-[live=true]:opacity-100'
        data-live={live}
      />
    </div>
  )
}
