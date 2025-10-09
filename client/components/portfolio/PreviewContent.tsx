import React from 'react'
import Image from 'next/image'

interface PreviewContentProps {
  heroImageUrl?: string
}

export const PreviewContent: React.FC<PreviewContentProps> = ({ heroImageUrl }) => {
  // Only show image if we have a valid heroImageUrl
  if (heroImageUrl) {
    return (
      <div className='bg-white/95 p-1 rounded-lg shadow-lg overflow-hidden h-44 sm:h-48'>
        <Image
          src={heroImageUrl}
          alt='Hero image'
          className='w-full h-full object-cover '
          width={900}
          height={500}
        />
      </div>
    )
  }

  // No fallback content - if no image, show nothing
  return null
}
