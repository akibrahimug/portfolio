import Link from 'next/link'
import React, { ReactNode } from 'react'

interface SocialMediaProps {
  icon: ReactNode
  link: string
  text: string
}

const SocialMedia: React.FC<SocialMediaProps> = ({ icon, link, text }) => {
  return (
    <Link
      rel='noreferrer'
      target='_blank'
      href={link}
      className='flex items-center border mt-4 p-4 ml-4 mr-4 rounded-xl hover:bg-gray-100 hover:shadow-sm active:scale-95 transition duration-100'
    >
      <span className='mr-3 text-red-500'>{icon}</span>
      <p>{text}</p>
    </Link>
  )
}

export default SocialMedia
