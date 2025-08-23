/**
 * Server health and statistics dashboard component.
 * Uses WebSocket to show real-time server metrics.
 */

import React from 'react'
import { useStats } from '@/hooks/useStats'

export default function ServerStats() {
  const { stats, connected, error, requestStats, subscribeToStats } = useStats({
    autoConnect: true,
    subscribe: true,
    intervalMs: 5000,
  })

  if (error) {
    return (
      <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
        <h3 className='font-medium text-red-800'>Connection Error</h3>
        <p className='text-red-600 text-sm'>{error}</p>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <h3 className='font-medium text-yellow-800'>Connecting...</h3>
        <p className='text-yellow-600 text-sm'>Establishing connection to server</p>
      </div>
    )
  }

  return (
    <div className='p-4 bg-white border border-gray-200 rounded-lg shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium text-gray-900'>Server Statistics</h3>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          <span className='text-sm text-green-600'>Connected</span>
        </div>
      </div>

      {stats ? (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>{stats.connections}</div>
            <div className='text-sm text-gray-500'>Active Connections</div>
          </div>

          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>{stats.epm}</div>
            <div className='text-sm text-gray-500'>Events/Min</div>
          </div>

          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>
              {(stats.errorRate * 100).toFixed(1)}%
            </div>
            <div className='text-sm text-gray-500'>Error Rate</div>
          </div>

          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>{stats.p95ms}ms</div>
            <div className='text-sm text-gray-500'>P95 Response</div>
          </div>
        </div>
      ) : (
        <div className='text-center text-gray-500'>
          <p>Loading server statistics...</p>
          <button
            onClick={requestStats}
            className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
          >
            Refresh Stats
          </button>
        </div>
      )}
    </div>
  )
}
