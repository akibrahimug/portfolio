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
      icon: <GithubLogo weight='bold' className='h-6 w-6' />,
      url: 'https://github.com/akibrahimug',
      label: 'GitHub',
    },
    {
      icon: <LinkedinLogo weight='bold' className='h-6 w-6' />,
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
            className='h-6 w-6 transition-all duration-200 '
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
              <div className='hidden md:flex items-center text-gray-500 text-sm mr-3 pr-4 border-r border-gray-300/60'>
                Check out my
              </div>

              <div className='flex space-x-3 items-center'>
                {socialLinks.map((link, index) => {
                  const gradient =
                    index === 0
                      ? 'from-purple-400 to-pink-400'
                      : index === 1
                      ? 'from-green-400 to-blue-400'
                      : 'from-sky-400 to-indigo-500'
                  return (
                    <MotionA
                      key={index}
                      href={link.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group/social relative flex items-center justify-center h-12 w-12 rounded-full overflow-hidden bg-white/80 text-gray-800 border border-gray-200/80 backdrop-blur-sm shadow-sm transition-colors duration-300 group-hover/social:text-white hover:text-white'
                      aria-label={link.label}
                    >
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} transform scale-x-0 group-hover/social:scale-x-100 transition-transform duration-300 origin-left opacity-90`}
                      ></div>
                      <span className='relative z-10'>
                        {index === 2 ? (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Image
                              src={'/icons/twitter.svg'}
                              alt='twitter'
                              width={20}
                              height={20}
                              className='h-6 w-6 group-hover/social:invert group-hover/social:brightness-0'
                            />
                          </div>
                        ) : (
                          <span>{link.icon}</span>
                        )}
                      </span>
                    </MotionA>
                  )
                })}
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
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className='group flex items-center text-gray-500 text-sm transition-all'
                  tabIndex={0}
                >
                  <CheckCircle
                    aria-hidden
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-300 transition-transform duration-200 group-hover:scale-110 group-hover:text-gray-400 group-focus:scale-110 group-focus:text-gray-400'
                  />
                  <span className='transition-colors duration-200 group-hover:text-gray-700 group-focus:text-gray-700'>
                    {item}
                  </span>
                </MotionDiv>
              ))}
            </MotionDiv>
          )}
        </section>
      </div>
    </div>
  )
}
