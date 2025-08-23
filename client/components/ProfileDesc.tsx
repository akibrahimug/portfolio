'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  PaperPlaneTilt,
  ArrowUpRight,
  GithubLogo,
  LinkedinLogo,
  CheckCircle,
} from '@phosphor-icons/react'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface SocialLink {
  icon: React.ReactNode
  url: string
  label: string
}

interface ProfileDescProps {
  certified: string[]
}

export default function ProfileDesc({ certified }: ProfileDescProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Define motion components with proper typing
  const MotionDiv = motion.div as any
  const MotionA = motion.a as any

  useEffect(() => {
    // Simulate data fetching with a delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // 0.5 seconds delay

    return () => clearTimeout(timer)
  }, [])

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  const socialLinks: SocialLink[] = [
    {
      icon: <GithubLogo className='h-5 w-5' />,
      url: 'https://github.com/akibrahimug',
      label: 'GitHub',
    },
    {
      icon: <LinkedinLogo className='h-5 w-5' />,
      url: 'https://www.linkedin.com/in/kasoma-ibrahim-89a732168/',
      label: 'LinkedIn',
    },
    {
      icon: (
        <div className='w-full h-full flex items-center justify-center hover:brightness-0 hover:invert'>
          <Image
            src={'/icons/twitter.svg'}
            alt='twitter'
            width={20}
            height={20}
            className='h-5 w-5 transition-all duration-200 '
          />
        </div>
      ),
      url: 'https://twitter.com/Akibrahimug',
      label: 'Twitter',
    },
  ]

  const handleEmail = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const emailParams = new URLSearchParams({
      subject: 'Regarding Your work as a Software Engineer',
      body: 'Hello Kasoma,\n\nI saw your website and would like to discuss...',
    }).toString()
    window.open(`mailto:kasomaibrahim@gmail.com?${emailParams}`, '_self')
  }, [])

  return (
    <div className='container mx-auto px-14 py-12 md:py-46 xl:py-40'>
      <div className='max-w-5xl mx-auto'>
        {/* Hero Section */}
        <section className='space-y-6 md:space-y-10'>
          {isLoading ? (
            <div className='space-y-4'>
              <div className='h-8 bg-gray-200 rounded-md w-64 animate-pulse'></div>
              <div className='h-24 bg-gray-200 rounded-md w-full animate-pulse'></div>
              <div className='h-24 bg-gray-200 rounded-md w-3/4 animate-pulse'></div>
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='space-y-2 text-center md:text-left'
            >
              <h2 className='text-2xl md:text-3xl font-medium'>
                Hi, I&apos;m <span className='text-red-600 font-semibold'>Ibrahim</span> a
              </h2>
              <h1 className='text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-gray-500 leading-tight'>
                FULLSTACK
                <br className='hidden sm:block' /> DEVELOPER
              </h1>
            </MotionDiv>
          )}

          {/* Action Buttons */}
          {isLoading ? (
            <div className='flex justify-center md:justify-start space-x-4'>
              <div className='h-10 bg-gray-200 rounded-md w-32 animate-pulse'></div>
              <div className='h-10 bg-gray-200 rounded-md w-32 animate-pulse'></div>
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='flex flex-wrap justify-center md:justify-start gap-4'
            >
              <Button
                onClick={handleEmail}
                className='bg-red-500 hover:bg-red-600 text-white rounded-[11px] px-4 hover:scale-125 transition-transform duration-700'
              >
                Let&apos;s talk
                <PaperPlaneTilt className='ml-2 h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                className='rounded-full text-gray-700 hover:bg-transparent hover:scale-125 transition-transform duration-700'
                onClick={scrollToProjects}
              >
                Portfolio
                <ArrowUpRight className='ml-2 h-4 w-4' />
              </Button>
            </MotionDiv>
          )}

          {/* Social Links */}
          {isLoading ? (
            <div className='flex justify-center md:justify-start space-x-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-12 w-12 bg-gray-200 rounded-full animate-pulse'></div>
              ))}
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='flex justify-center md:justify-start space-x-4'
            >
              <div className='hidden md:flex items-center text-gray-400 text-sm mr-4'>
                Check out my
                <svg className='h-24 w-24 ml-2 rotate-90' viewBox='0 0 100 100'>
                  <line x1='0' y1='50' x2='100' y2='50' stroke='currentColor' strokeWidth='1' />
                </svg>
              </div>

              <div className='flex space-x-3 items-center'>
                {socialLinks.map((link, index) => (
                  <MotionA
                    key={index}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center h-12 w-12 rounded-full bg-white border border-gray-200 shadow-md hover:border-red-500 hover:bg-red-500 hover:text-white  transition-all duration-300 hover:scale-105 active:scale-75'
                    whileHover={{ y: -2 }}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </MotionA>
                ))}
              </div>
            </MotionDiv>
          )}
        </section>

        {/* Certifications */}
        <section className='mt-16'>
          {isLoading ? (
            <div className='grid grid-cols-2 gap-3'>
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className='h-6 bg-gray-200 rounded-md animate-pulse'></div>
                ))}
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className='grid md:grid-cols-2 gap-x-8 gap-y-3'
            >
              {certified.map((item, index) => (
                <MotionDiv
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className='flex items-center text-gray-400 text-sm'
                >
                  <CheckCircle className='text-red-400 mr-2 h-5 w-5 flex-shrink-0' />
                  <span>{item}</span>
                </MotionDiv>
              ))}
            </MotionDiv>
          )}
        </section>
      </div>
    </div>
  )
}
