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
import { FadeIn, SlideUp } from '@/lib/lightweight-animation'

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
        <div className='w-full h-full flex items-center justify-center'>
          <Image
            src={'/icons/twitter.svg'}
            alt='twitter'
            width={20}
            height={20}
            className='h-6 w-6'
            loading='lazy'
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
            <SlideUp className='space-y-2 text-center md:text-left'>
              <h2 className='text-2xl md:text-3xl font-medium'>
                Hi, I&apos;m <span className='text-brand-600 font-semibold'>Ibrahim</span> a
              </h2>
              <h1 className='text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-gray-500 leading-tight'>
                FULLSTACK
                <br className='hidden sm:block' /> DEVELOPER
              </h1>
            </SlideUp>
          )}

          {/* Action Buttons */}
          {isLoading ? (
            <div className='flex justify-center md:justify-start space-x-4'>
              <div className='h-10 bg-gray-200 rounded-md w-32 animate-pulse'></div>
              <div className='h-10 bg-gray-200 rounded-md w-32 animate-pulse'></div>
            </div>
          ) : (
            <SlideUp delay={200} className='flex flex-wrap justify-center md:justify-start gap-4'>
              <Button
                onClick={handleEmail}
                className='bg-brand-500 hover:bg-brand-600 text-white rounded-[11px] px-4 hover:scale-125 transition-transform duration-700'
              >
                Let&apos;s talk
                <PaperPlaneTilt className='ml-2 h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                className='rounded-full text-gray-800 hover:bg-transparent hover:scale-125 hover:text-brand-600 transition-all duration-700'
                onClick={scrollToProjects}
              >
                Portfolio
                <ArrowUpRight className='ml-2 h-4 w-4' />
              </Button>
            </SlideUp>
          )}

          {/* Social Links */}
          {isLoading ? (
            <div className='flex justify-center md:justify-start space-x-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-12 w-12 bg-gray-200 rounded-full animate-pulse'></div>
              ))}
            </div>
          ) : (
            <SlideUp delay={400} className='flex justify-center md:justify-start space-x-4'>
              <div className='hidden md:flex items-center text-gray-600 text-sm mr-3 pr-4 border-r border-gray-300/60'>
                Check out my
              </div>

              <div className='flex space-x-3 items-center'>
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center h-12 w-12 rounded-full bg-white/80 text-gray-800 border border-gray-200/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
                    aria-label={link.label}
                  >
                    {index === 2 ? (
                      <div className='w-full h-full flex items-center justify-center'>
                        <Image
                          src={'/icons/twitter.svg'}
                          alt='twitter'
                          width={20}
                          height={20}
                          className='h-6 w-6'
                          loading='lazy'
                        />
                      </div>
                    ) : (
                      <span>{link.icon}</span>
                    )}
                  </a>
                ))}
              </div>
            </SlideUp>
          )}
        </section>

        {/* Certifications */}
        <section className='mt-16 hidden sm:block'>
          {isLoading ? (
            <div className='grid grid-cols-2 gap-3'>
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className='h-6 bg-gray-200 rounded-md animate-pulse'></div>
                ))}
            </div>
          ) : (
            <FadeIn delay={600} className='grid sm:grid-cols-2 gap-x-8 gap-y-3'>
              {certified.map((item, index) => (
                <div
                  key={index}
                  className='group flex items-center text-gray-600 text-sm transition-all hover:translate-x-1'
                  tabIndex={0}
                >
                  <CheckCircle
                    aria-hidden
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-300 transition-all duration-200 group-hover:scale-110 group-hover:text-brand-500 group-focus:scale-110 group-focus:text-brand-500'
                  />
                  <span className='transition-colors duration-200 group-hover:text-gray-800 group-focus:text-gray-800'>
                    {item}
                  </span>
                </div>
              ))}
            </FadeIn>
          )}
        </section>
      </div>
    </div>
  )
}
