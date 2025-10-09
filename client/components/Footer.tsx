'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { GithubLogo, LinkedinLogo, EnvelopeSimple, ArrowUp } from '@phosphor-icons/react'
import Image from 'next/image'
import { httpClient } from '@/lib/http-client'

interface FooterLink {
  label: string
  href: string
}

interface SocialLink {
  icon: React.ReactNode
  href: string
  label: string
}

interface Technology {
  name: string
  icon: string
  color: string
  experience?: string
  learningSource?: string
  confidenceLevel?: number
  description?: string
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [technologies, setTechnologies] = useState<Technology[]>([])

  // Fetch technologies from API
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await httpClient.getPublicTechnologies()
        if (response.success && response.data?.items) {
          setTechnologies(response.data.items as Technology[])
        }
      } catch (error) {
        console.error('Failed to fetch technologies:', error)
      }
    }

    fetchTechnologies()
  }, [])

  // Get featured technologies for "Built With" section
  const builtWithTechs = useMemo(() => {
    const featuredNames = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS']

    return featuredNames
      .map((name) => technologies.find((tech) => tech.name === name))
      .filter(Boolean) as Technology[]
  }, [technologies])

  // Map tech to colors
  const getTechColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      'Next.js': 'bg-brand-500',
      React: 'bg-stack-500',
      TypeScript: 'bg-ai-500',
      'Tailwind CSS': 'bg-fun-500',
    }
    return colorMap[name] || 'bg-gray-500'
  }

  const quickLinks: FooterLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Tech Stack', href: '/#tech-stack' },
    { label: 'About', href: '/#about' },
  ]

  const projectLinks: FooterLink[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Color Test', href: '/color-test' },
  ]

  const socialLinks: SocialLink[] = [
    {
      icon: <GithubLogo weight='bold' className='h-5 w-5' />,
      href: 'https://github.com/akibrahimug',
      label: 'GitHub',
    },
    {
      icon: <LinkedinLogo weight='bold' className='h-5 w-5' />,
      href: 'https://www.linkedin.com/in/kasoma-ibrahim-89a732168/',
      label: 'LinkedIn',
    },
    {
      icon: (
        <Image src='/icons/twitter.svg' alt='Twitter' width={20} height={20} className='h-5 w-5' />
      ),
      href: 'https://twitter.com/Akibrahimug',
      label: 'Twitter',
    },
    {
      icon: <EnvelopeSimple weight='bold' className='h-5 w-5' />,
      href: 'mailto:kasomaibrahim@gmail.com',
      label: 'Email',
    },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className='bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
          {/* Brand Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-gray-700 dark:text-gray-300'>Kasoma Ibrahim</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
              Full Stack Developer passionate about creating amazing web experiences with modern
              technologies.
            </p>
            <div className='flex gap-3'>
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className='flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300 hover:scale-110'
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-gray-700 dark:text-gray-300'>Quick Links</h3>
            <ul className='space-y-2'>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className='text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200 inline-flex items-center group'
                  >
                    <span className='group-hover:translate-x-1 transition-transform duration-200'>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Links */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-gray-700 dark:text-gray-300'>Project</h3>
            <ul className='space-y-2'>
              {projectLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className='text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200 inline-flex items-center group'
                  >
                    <span className='group-hover:translate-x-1 transition-transform duration-200'>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack Info */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-gray-700 dark:text-gray-300'>Built With</h3>
            <ul className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
              {builtWithTechs.map((tech, index) => (
                <li key={index} className='flex items-center gap-2'>
                  <span className={`w-1.5 h-1.5 rounded-full ${getTechColor(tech.name)}`}></span>
                  {tech.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left'>
            © {currentYear} Kasoma Ibrahim. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-300 hover:scale-105'
            aria-label='Scroll to top'
          >
            <span className='text-sm font-medium'>Back to top</span>
            <ArrowUp className='h-4 w-4' />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
