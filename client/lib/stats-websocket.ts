/**
 * Minimal WebSocket client for server health and statistics monitoring only.
 * This replaces the full WebSocket client and only handles stats/health events.
 */

import type { StatsData } from '@/types/api'

interface StatsMessage {
  event: 'stats:get' | 'stats:subscribe' | 'system:ping' | 'system:welcome'
  payload: any
}

type StatsListener = (data: StatsData) => void

class StatsWebSocketClient {
  private ws: WebSocket | null = null
  private listeners = new Map<string, Set<StatsListener>>()
  private reconnectTimer: any = null
  private pingInterval: any = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  private get wsUrl(): string {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    try {
      const url = new URL(apiBase)
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProtocol}//${url.host}${url.pathname.replace(/\/+$/, '')}/v1/ws`
    } catch {
      return 'ws://localhost:5000/api/v1/ws'
    }
  }

  connect() {
    if (typeof window === 'undefined') return
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket(this.wsUrl)

      this.ws.addEventListener('open', () => {
        console.info('[Stats WS] Connected')
        this.reconnectAttempts = 0
        this.startPing()
      })

      this.ws.addEventListener('message', (event) => {
        try {
          const message: StatsMessage = JSON.parse(event.data)
          if (message.event === 'stats:get' || message.event === 'stats:subscribe') {
            this.emit('stats', message.payload)
          }
        } catch (err) {
          console.warn('[Stats WS] Failed to parse message:', err)
        }
      })

      this.ws.addEventListener('close', () => {
        console.info('[Stats WS] Disconnected')
        this.stopPing()
        this.scheduleReconnect()
      })

      this.ws.addEventListener('error', (err) => {
        console.warn('[Stats WS] Error:', err)
      })
    } catch (err) {
      console.error('[Stats WS] Failed to connect:', err)
      this.scheduleReconnect()
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.stopPing()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Get current stats (one-time)
  getStats() {
    this.send('stats:get', { version: 'v1' })
  }

  // Subscribe to periodic stats updates
  subscribeStats(intervalMs = 5000) {
    this.send('stats:subscribe', { version: 'v1', intervalMs })
  }

  // Listen for stats updates
  onStats(listener: StatsListener) {
    if (!this.listeners.has('stats')) {
      this.listeners.set('stats', new Set())
    }
    this.listeners.get('stats')!.add(listener)
  }

  // Remove stats listener
  offStats(listener: StatsListener) {
    this.listeners.get('stats')?.delete(listener)
  }

  private send(event: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }))
    }
  }

  private emit(eventType: string, data: any) {
    this.listeners.get(eventType)?.forEach((listener) => {
      try {
        listener(data)
      } catch (err) {
        console.error('[Stats WS] Listener error:', err)
      }
    })
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send('system:ping', { version: 'v1', ts: Date.now() })
    }, 30000)
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      console.info(`[Stats WS] Reconnecting... (attempt ${this.reconnectAttempts})`)
      this.connect()
    }, delay)
  }
}

// HMR-safe singleton
declare global {
  var __STATS_WS_CLIENT__: StatsWebSocketClient | undefined
}

export const statsWsClient: StatsWebSocketClient =
  (globalThis as any).__STATS_WS_CLIENT__ ?? new StatsWebSocketClient()
;(globalThis as any).__STATS_WS_CLIENT__ = statsWsClient
