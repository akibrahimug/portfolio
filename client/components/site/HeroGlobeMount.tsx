'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { TECH_FACTS, TECH_HUBS, type TechHub } from '@/lib/tech-facts'
import type { GlobeBridge } from './HeroGlobe'

// three.js + R3F stay behind this dynamic import → only loaded for dark-mode visitors.
const HeroGlobe = dynamic(() => import('./HeroGlobe'), { ssr: false, loading: () => null })

function webglSupported(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export function HeroGlobeMount() {
  const reduced = useReducedMotion()
  const [supported, setSupported] = React.useState<boolean | null>(null)
  const [i, setI] = React.useState(0)
  const [hub, setHub] = React.useState<TechHub | null>(null)

  // Shared, render-free channel between the Canvas (writes hub screen coords) and the DOM dots.
  const bridge = React.useRef<GlobeBridge>({
    screen: TECH_HUBS.map(() => ({ x: 0, y: 0, visible: false })),
    frozen: false,
  })
  const dots = React.useRef<(HTMLButtonElement | null)[]>([])

  React.useEffect(() => setSupported(webglSupported()), [])

  // rotating industry fact (pauses while a hub is focused)
  React.useEffect(() => {
    if (reduced || hub) return
    const id = setInterval(() => setI((n) => (n + 1) % TECH_FACTS.length), 5000)
    return () => clearInterval(id)
  }, [reduced, hub])

  // position the DOM hit-dots over the projected hubs each frame
  React.useEffect(() => {
    let raf = 0
    const loop = () => {
      const s = bridge.current.screen
      for (let k = 0; k < s.length; k++) {
        const el = dots.current[k]
        if (!el) continue
        if (s[k].visible) {
          el.style.display = 'block'
          el.style.left = `${s[k].x}px`
          el.style.top = `${s[k].y}px`
        } else {
          el.style.display = 'none'
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Freeze the spin whenever the pointer is over the globe, so the pins stop
  // moving the moment you reach for them (and never re-spin between pins).
  const freeze = () => {
    bridge.current.frozen = true
  }
  const unfreeze = () => {
    bridge.current.frozen = false
  }
  const focusHub = (h: TechHub) => setHub(h)
  const blurHub = () => setHub(null)

  return (
    <div className='order-first md:order-last md:-mt-90'>
      <div
        className='relative mx-auto aspect-square w-72 sm:w-80 md:w-full'
        onPointerEnter={freeze}
        onPointerLeave={unfreeze}
      >
        {supported === false ? (
          <div className='absolute inset-0 grid place-items-center'>
            <div className='h-44 w-44 rounded-full border border-border-strong opacity-60' />
          </div>
        ) : (
          <>
            <HeroGlobe bridge={bridge} />
            {/* invisible DOM hit-dots projected over the red markers */}
            <div className='pointer-events-none absolute inset-0 z-10'>
              {TECH_HUBS.map((h, k) => (
                <button
                  key={h.city}
                  ref={(el) => {
                    dots.current[k] = el
                  }}
                  type='button'
                  aria-label={h.city}
                  onMouseEnter={() => focusHub(h)}
                  onMouseLeave={blurHub}
                  onFocus={() => focusHub(h)}
                  onBlur={blurHub}
                  style={{ display: 'none' }}
                  className='pointer-events-auto absolute -ml-4 -mt-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full'
                >
                  <span className='block h-5 w-5 rounded-full ring-1 ring-accent/40 transition hover:ring-2 hover:ring-accent focus:ring-2 focus:ring-accent' />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* hover a hub → its info; otherwise a rotating industry fact */}
      <div className='mx-auto mt-3 min-h-[4.5rem] max-w-sm text-center md:text-left'>
        <AnimatePresence mode='wait'>
          {hub ? (
            <motion.div
              key={`hub-${hub.city}`}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className='text-[11px] uppercase tracking-[0.2em] text-accent'>{hub.city}</p>
              <p className='mt-2 text-sm leading-relaxed text-foreground'>{hub.note}</p>
            </motion.div>
          ) : (
            <motion.div
              key={`fact-${i}`}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className='text-[11px] uppercase tracking-[0.2em] text-accent'>Tech industry</p>
              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{TECH_FACTS[i]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
