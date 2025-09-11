import React from 'react'
import type { PortfolioPreviewType } from '@/types/portfolio'

interface PreviewContentProps {
  previewType?: PortfolioPreviewType
}

export const PreviewContent: React.FC<PreviewContentProps> = ({ previewType }) => {
  switch (previewType) {
    case 'platform':
      return (
        <div className='bg-white/95 p-3 rounded-lg shadow-lg h-36'>
          <div className='bg-gray-200 h-2 rounded mb-1 animate-pulse'></div>
          <div className='flex space-x-2 mb-1 h-8'>
            <div className='bg-green-400 w-6 h-6 rounded-full animate-ping flex items-center justify-center'></div>
          </div>
        </div>
      )
    default:
      return null
  }
}
