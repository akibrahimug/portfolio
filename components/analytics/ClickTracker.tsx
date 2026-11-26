'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { OPT_OUT_KEY, TRACKABLE, trackKey } from '@/extension/track-key.js'

/**
 * Cookie-free analytics: a page view per route, and a click per link/button (keyed by
 * `extension/track-key.js`, which the click-inspector extension shares). Renders nothing.
 */

function optedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}

function send(body: object) {
  if (optedOut()) return
  const json = JSON.stringify(body)
  // sendBeacon survives the navigation a link click starts; fetch keepalive is the fallback.
  if (navigator.sendBeacon?.('/api/track', new Blob([json], { type: 'application/json' }))) return
  fetch('/api/track', { method: 'POST', body: json, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(
    () => {},
  )
}

export function ClickTracker() {
  const pathname = usePathname()
  // One view per route change, even when an effect re-runs (Strict Mode, a remount).
  const counted = useRef<string | null>(null)

  useEffect(() => {
    if (counted.current === pathname) return
    counted.current = pathname
    send({ type: 'view', path: pathname })
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(TRACKABLE)
      if (!el) return
      send({ type: 'click', path: location.pathname, key: trackKey(el, location.origin) })
    }
    // Capture phase: counted even when a handler stops propagation or the link navigates away.
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}
