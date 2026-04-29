'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { AnimatedHeading } from '@/components/ui/AnimatedHeading'
import { useReducedMotion } from 'framer-motion'

const ROLES = ['SENIOR FRONTEND ENGINEER', 'PLATFORM ENGINEER', 'UX ENGINEER']
const SCRAMBLE_GLYPHS = '!<>-_\\/[]{}—=+*^?#%&$@01'

/**
 * Decoder/scramble effect: each character cycles through random glyphs
 * before locking to its target, sequentially. Returns the current display
 * value, which is updated on each animation frame until the transition
 * completes. When `enabled` is false, returns the target value immediately
 * (used for prefers-reduced-motion).
 */
function useScramble(target: string, enabled: boolean): string {
  const [display, setDisplay] = useState(target)
  const lastTargetRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setDisplay(target)
      lastTargetRef.current = target
      return
    }
    const old = lastTargetRef.current
    if (old === target) return

    const length = Math.max(old.length, target.length)
    type Slot = { from: string; to: string; start: number; end: number; ch?: string }
    const queue: Slot[] = []
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * 18)
      const end = start + 14 + Math.floor(Math.random() * 22)
      queue.push({ from: old[i] || ' ', to: target[i] || ' ', start, end })
    }

    let frame = 0
    const tick = () => {
      let out = ''
      let done = 0
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i]
        if (frame >= q.end) {
          done++
          out += q.to
        } else if (frame >= q.start) {
          if (!q.ch || Math.random() < 0.28) {
            q.ch = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)]
          }
          out += q.ch
        } else {
          out += q.from
        }
      }
      setDisplay(out)
      if (done === queue.length) {
        lastTargetRef.current = target
        return
      }
      frame++
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, enabled])

  return display
}

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
  const [idx, setIdx] = useState<number>(0)
  const [paused, setPaused] = useState<boolean>(false)
  const reduced = useReducedMotion()
  const display = useScramble(ROLES[idx], !reduced)
  const settling = display !== ROLES[idx]

  useEffect(() => {
    // Simulate data fetching with a delay.
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // 0.5 seconds delay

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (reduced || paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % ROLES.length), 2800)
    return () => clearInterval(t)
  }, [reduced, paused])

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  const socialLinks: SocialLink[] = [
    {
      icon: <GithubLogo weight='bold' className='h-5 w-5 transition-colors duration-300' />,
      url: 'https://github.com/akibrahimug',
      label: 'GitHub',
    },
    {
      icon: <LinkedinLogo weight='bold' className='h-5 w-5 transition-colors duration-300' />,
      url: 'https://www.linkedin.com/in/kasoma-ibrahim-89a732168/',
      label: 'LinkedIn',
    },
    {
      icon: (
        <div className='w-full h-full flex items-center justify-center'>
          <Image
            src={'/icons/twitter.svg'}
            alt='twitter'
            width={18}
            height={18}
            className='h-5 w-5 transition-all duration-300'
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
    <div className='container mx-auto px-4 sm:px-8 md:px-14 py-12 md:py-46 xl:py-40'>
      <div className='max-w-5xl mx-auto'>
        {/* Hero Section */}
        <section className='space-y-6 md:space-y-10'>
          {isLoading ? (
            <div className='space-y-4 flex flex-col items-center md:items-start'>
              <div className='h-6 sm:h-8 bg-gray-200 rounded-md w-48 sm:w-64 animate-pulse'></div>
              <div className='h-8 sm:h-12 md:h-14 lg:h-16 bg-gray-200 rounded-md w-full max-w-md sm:max-w-lg md:max-w-xl animate-pulse'></div>
              <div className='h-8 sm:h-12 md:h-14 lg:h-16 bg-gray-200 rounded-md w-4/5 max-w-sm sm:max-w-md md:max-w-lg animate-pulse'></div>
            </div>
          ) : (
            <SlideUp className='space-y-2 text-center md:text-left'>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-medium'>
                Hi, I&apos;m <span className='text-brand-600 font-semibold'>Ibrahim</span> a
              </h2>
              <AnimatedHeading
                as='h1'
                fadeInOnView
                className='text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-500 leading-[1.15]'
              >
                <span
                  className='relative block'
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  {/* Phantom: reserves the height of the longest role at every breakpoint so the rotator never causes layout shift */}
                  <span aria-hidden className='invisible block whitespace-normal'>
                    {ROLES.reduce((a, b) => (a.length >= b.length ? a : b))}
                  </span>
                  <span
                    aria-live='polite'
                    className={
                      'absolute inset-0 block font-mono tabular-nums tracking-tight transition-colors duration-300 ' +
                      (settling
                        ? 'text-brand-500 [text-shadow:0_0_18px_rgba(239,68,68,0.45)]'
                        : 'text-gray-500')
                    }
                  >
                    {display}
                  </span>
                </span>
              </AnimatedHeading>
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
                    className='group flex items-center justify-center h-10 w-10 rounded-full bg-white/80 text-gray-800 border border-gray-200/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 hover:bg-brand-500 hover:text-white hover:border-brand-500'
                    aria-label={link.label}
                  >
                    {index === 2 ? (
                      <div className='w-full h-full flex items-center justify-center'>
                        <Image
                          src={'/icons/twitter.svg'}
                          alt='twitter'
                          width={18}
                          height={18}
                          className='h-5 w-5 transition-all duration-300 group-hover:brightness-0 group-hover:invert'
                          loading='lazy'
                        />
                      </div>
                    ) : (
                      <span className='group-hover:text-white'>{link.icon}</span>
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
