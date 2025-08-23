// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { StyledEngineProvider } from '@mui/material'
import { useEffect, useRef } from 'react'
import { statsWsClient } from '@/lib/stats-websocket'

// Auth is now handled by Clerk - no need for custom AuthProvider

// Mount-once stats WS bootstrapper (guards StrictMode double-invoke)
function StatsBootstrap() {
  const bootedRef = useRef(false)

  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true

    // Connect to stats WebSocket for monitoring
    statsWsClient.connect()

    return () => {
      // Don't disconnect here — StrictMode will unmount/mount effects in dev.
    }
  }, [])

  return null
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider injectFirst>
      <StatsBootstrap />
      <Component {...pageProps} />
    </StyledEngineProvider>
  )
}

export default MyApp
