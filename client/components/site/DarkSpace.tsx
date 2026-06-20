'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

// three.js stays code-split and only loads in dark mode.
const SpaceBackground = dynamic(() => import('./SpaceBackground'), { ssr: false, loading: () => null })

function webglSupported(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

/** Full-page starfield, dark mode only (skipped where WebGL is unavailable). */
export function DarkSpace() {
  const { resolvedTheme } = useTheme()
  const [ok, setOk] = React.useState(false)
  React.useEffect(() => setOk(webglSupported()), [])
  if (!ok || resolvedTheme !== 'dark') return null
  return <SpaceBackground />
}
