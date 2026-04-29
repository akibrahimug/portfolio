import React, { ReactNode } from 'react'
import { SocialIconLink } from '@/components/ui'

interface SocialMediaProps {
  icon: ReactNode
  link: string
  text: string
}

const SocialMedia: React.FC<SocialMediaProps> = ({ icon, link, text }) => {
  return (
    <div className='flex items-center mt-4 ml-4 mr-4'>
      <SocialIconLink href={link} label={text} icon={icon} />
      <p className='ml-3'>{text}</p>
    </div>
  )
}

export default SocialMedia
