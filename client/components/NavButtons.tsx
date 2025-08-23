'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { GithubLogo } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NavButtons = () => {
  const router = useRouter()
  const scrollToProjects = () => {
    document.getElementById('tech-stack')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  const handleEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const emailParams = new URLSearchParams({
      subject: 'Regarding Your work as a Software Engineer',
      body: 'Hello Kasoma,\n\nI saw your website and would like to discuss...',
    }).toString()
    window.open(`mailto:kasomaibrahim@gmail.com?${emailParams}`, '_self')
  }

  return (
    <div className='flex flex-wrap justify-center gap-1 w-full max-w-md mx-auto '>
      <div className='flex w-full sm:w-auto rounded-full shadow-sm overflow-hidden '>
        {/* Contact Me */}
        <Button
          className='flex-1 h-10 px-4  rounded-none border-r text-left justify-start font-normal hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer'
          onClick={handleEmail}
        >
          Email Me
        </Button>

        {/* TechStack */}
        <Button
          variant='ghost'
          className='flex-1 h-10 px-4 rounded-none border-r text-left justify-start  text-gray-500 font-extralight hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer '
          value='TechStack'
          onClick={scrollToProjects}
        >
          TechStack
        </Button>

        {/* REST API with GitHub icon */}
        <div className='flex-1 relative flex items-center'>
          <Button
            variant='ghost'
            className='h-10 w-full pl-4 pr-12 rounded-none text-left justify-start font-normal hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer'
            value='Restful API'
            onClick={() => router.push('/restapi')}
          >
            REST API
          </Button>

          <Link
            href='https://github.com/akibrahimug'
            target='_blank'
            rel='noopener noreferrer'
            className='absolute right-5 transform translate-x-1/2'
            aria-label='GitHub Profile'
          >
            <GithubLogo className='w-5 h-5' />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NavButtons
