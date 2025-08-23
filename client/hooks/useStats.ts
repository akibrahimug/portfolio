/**
 * React hook for monitoring server stats via WebSocket.
 * Provides real-time server health and performance metrics.
 */

import { useState, useEffect, useCallback } from 'react'
import { statsWsClient } from '@/lib/stats-websocket'
import type { StatsData } from '@/types/api'

interface UseStatsOptions {
  autoConnect?: boolean
  subscribe?: boolean
  intervalMs?: number
}

export function useStats(options: UseStatsOptions = {}) {
  const { autoConnect = true, subscribe = false, intervalMs = 5000 } = options

  const [stats, setStats] = useState<StatsData | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatsUpdate = useCallback((data: StatsData) => {
    setStats(data)
    setError(null)
  }, [])

  const connect = useCallback(() => {
    try {
      statsWsClient.connect()
      setConnected(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setConnected(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    statsWsClient.disconnect()
    setConnected(false)
  }, [])

  const requestStats = useCallback(() => {
    if (connected) {
      statsWsClient.getStats()
    }
  }, [connected])

  const subscribeToStats = useCallback(() => {
    if (connected) {
      statsWsClient.subscribeStats(intervalMs)
    }
  }, [connected, intervalMs])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    // Set up stats listener
    statsWsClient.onStats(handleStatsUpdate)

    return () => {
      statsWsClient.offStats(handleStatsUpdate)
      if (autoConnect) {
        disconnect()
      }
    }
  }, [autoConnect, connect, disconnect, handleStatsUpdate])

  useEffect(() => {
    if (connected && subscribe) {
      subscribeToStats()
    }
  }, [connected, subscribe, subscribeToStats])

  return {
    stats,
    connected,
    error,
    connect,
    disconnect,
    requestStats,
    subscribeToStats,
  }
}
