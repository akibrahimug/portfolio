import React from 'react'
import type { PortfolioPreviewType } from '@/types/portfolio'

interface PreviewContentProps {
  previewType?: PortfolioPreviewType
}

export const PreviewContent: React.FC<PreviewContentProps> = ({ previewType }) => {
  switch (previewType) {
    case 'image':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='bg-gradient-to-r from-purple-400 to-pink-400 h-12 rounded mb-1 animate-pulse flex items-center justify-center'>
            <div className='w-4 h-4 bg-white/30 rounded-full'></div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>Style Transfer</div>
        </div>
      )
    case 'components':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='grid grid-cols-4 gap-1 mb-1 h-12'>
            <div
              className='bg-blue-400 rounded animate-bounce flex items-center justify-center text-white text-xs font-bold'
              style={{ animationDelay: '0s' }}
            >
              B
            </div>
            <div
              className='bg-green-400 rounded animate-bounce flex items-center justify-center text-white text-xs font-bold'
              style={{ animationDelay: '0.2s' }}
            >
              C
            </div>
            <div
              className='bg-red-400 rounded animate-bounce flex items-center justify-center text-white text-xs font-bold'
              style={{ animationDelay: '0.4s' }}
            >
              I
            </div>
            <div
              className='bg-yellow-400 rounded animate-bounce flex items-center justify-center text-white text-xs font-bold'
              style={{ animationDelay: '0.6s' }}
            >
              M
            </div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>Components</div>
        </div>
      )
    case 'visualization':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='flex items/end justify-center space-x-1 mb-1 h-12'>
            {[8, 12, 6, 10, 14, 4, 16].map((height, i) => (
              <div
                key={i}
                className='bg-blue-400 w-2 animate-pulse'
                style={{ height: `${height * 2}px`, animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>Data Viz</div>
        </div>
      )
    case 'platform':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='bg-gray-200 h-2 rounded mb-1 animate-pulse'></div>
          <div className='flex space-x-2 mb-1 h-8'>
            <div className='bg-green-400 w-6 h-6 rounded-full animate-ping flex items-center justify-center'>
              <div className='w-2 h-2 bg-white rounded-full'></div>
            </div>
            <div className='bg-gray-200 flex-1 h-6 rounded flex items-center px-2'>
              <div className='w-12 h-1 bg-gray-300 rounded animate-pulse'></div>
            </div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>Chat Platform</div>
        </div>
      )
    case 'game':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='bg-gradient-to-r from-indigo-400 to-purple-400 h-12 rounded mb-1 flex items-center justify-center relative'>
            <div className='w-4 h-4 bg-white rounded-full animate-bounce'></div>
            <div className='absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping'></div>
            <div className='absolute bottom-1 left-1 w-1 h-1 bg-red-400 rounded-full animate-pulse'></div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>3D Engine</div>
        </div>
      )
    case 'music':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='flex items-center justify-center space-x-1 mb-1 h-12'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className='bg-teal-400 w-2 animate-pulse'
                style={{ height: `${Math.random() * 30 + 10}px`, animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>Visualizer</div>
        </div>
      )
    case 'ar':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='bg-gradient-to-r from-purple-400 to-pink-400 h-12 rounded mb-1 flex items-center justify-center relative'>
            <div className='w-6 h-6 border-2 border-white rounded-full'></div>
            <div className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping'></div>
            <div className='absolute bottom-1 left-1 text-white text-xs font-bold'>AR</div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>AR Card</div>
        </div>
      )
    case 'chart':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='flex justify-between items-end mb-1 h-12'>
            {[10, 14, 8, 12, 16, 6].map((height, i) => (
              <div
                key={i}
                className='bg-gradient-to-t from-blue-600 to-blue-400 w-3 animate-pulse rounded-t'
                style={{ height: `${height * 2}px`, animationDelay: `${i * 0.3}s` }}
              ></div>
            ))}
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>ML Training</div>
        </div>
      )
    case 'dashboard':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='grid grid-cols-3 gap-1 mb-1 h-8'>
            <div className='bg-blue-400 rounded animate-pulse flex items-center justify-center'>
              <div className='w-4 h-4 bg-white rounded-full'></div>
            </div>
            <div
              className='bg-green-400 rounded animate-pulse flex items-center justify-center text-white text-xs font-bold'
              style={{ animationDelay: '0.2s' }}
            >
              85%
            </div>
            <div
              className='bg-yellow-400 rounded animate-pulse flex items-center justify-center text-white text-xs font-bold'
              style={{ animationDelay: '0.4s' }}
            >
              ON
            </div>
          </div>
          <div className='bg-gray-200 w/full h-4 rounded flex items-center px-1'>
            <div className='bg-red-400 h-2 w-1/3 rounded animate-pulse'></div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center mt-1'>Dashboard</div>
        </div>
      )
    case 'ecommerce':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-20'>
          <div className='grid grid-cols-2 gap-2 mb-1 h-10'>
            <div className='bg-gray-200 rounded flex items-center justify-center'>
              <div className='w-4 h-4 bg-gray-300 rounded'></div>
            </div>
            <div className='bg-gray-200 rounded flex items-center justify-center'>
              <div className='w-4 h-4 bg-gray-300 rounded'></div>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='bg-green-500 px-2 py-1 rounded text-white text-xs font-bold animate-pulse'>
              BUY
            </div>
          </div>
          <div className='text-xs text-gray-800 font-medium text-center'>Shop</div>
        </div>
      )
    default:
      return null
  }
}
