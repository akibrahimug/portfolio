'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useInViewport } from '@/lib/lightweight-animation'
import {
  MagnifyingGlass,
  X,
  ArrowSquareOut,
  Trophy,
  BookOpen,
  ChartBar,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { httpClient } from '@/lib/http-client'

// Extended Technology interface with additional details
interface Technology {
  name: string
  icon: string
  color: string
  category?: string
  experience?: string
  yearsOfExperience?: number
  learningSource?: string
  confidenceLevel?: number
  description?: string
}

/**
 * Displays an animated, searchable tech stack section with marquee scrolling and detailed modal views.
 *
 * Renders a responsive list of technologies with search filtering, animated marquee rows for large lists, and a modal for detailed information on each technology. Supports smooth animations, automatic selection on exact search match, and adapts layout based on the number of filtered technologies.
 */
export default function TechStackScroll() {
  const { ref: containerRef } = useInViewport({ threshold: 0.2 })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null)
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch technologies from API
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await httpClient.getPublicTechnologies()
        if (response.success && response.data?.items) {
          setTechnologies(response.data.items as unknown as Technology[])
        }
      } catch (error) {
        console.error('Failed to fetch technologies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTechnologies()
  }, [])

  // Memoized filtered technologies
  const filteredTech = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return !query
      ? technologies
      : technologies.filter((tech) => tech.name.toLowerCase().includes(query))
  }, [searchQuery, technologies])

  // Auto-select exact match
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()
    if (query && filteredTech.length === 1 && filteredTech[0].name.toLowerCase() === query) {
      setSelectedTech(filteredTech[0])
    }
  }, [searchQuery, filteredTech])

  // Memoized rows for marquee
  const rowTechnologies = useMemo(() => {
    if (!filteredTech.length) return [[], [], []]
    if (filteredTech.length <= 7) return [filteredTech, [], []]
    if (filteredTech.length <= 14) {
      const mid = Math.ceil(filteredTech.length / 2)
      return [filteredTech.slice(0, mid), filteredTech.slice(mid), []]
    }
    const size = Math.ceil(filteredTech.length / 3)
    return [
      filteredTech.slice(0, size),
      filteredTech.slice(size, size * 2),
      filteredTech.slice(size * 2),
    ]
  }, [filteredTech])

  const [row1, row2, row3] = rowTechnologies

  // Handle tech selection - memoized
  const handleTechSelect = useCallback((tech: Technology) => {
    setSelectedTech(tech)
  }, [])

  // Close tech detail modal - memoized
  const closeDetail = useCallback(() => {
    setSelectedTech(null)
  }, [])

  return (
    <section className='py-16 relative'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-8' ref={containerRef}>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-500 dark:text-gray-400 mb-4'>
            My Tech Stack
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-6'>
            Hover over the technologies to stop the scroll and click to see more details
          </p>

          <div className='relative max-w-md mx-auto'>
            <div className='relative'>
              <MagnifyingGlass className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
              <input
                type='text'
                placeholder='Search technologies...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all'
              />
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className='text-center py-12'>
            <p className='text-lg text-gray-600 dark:text-gray-300'>Loading technologies...</p>
          </div>
        ) : filteredTech.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              No technologies found matching &quot;{searchQuery}&quot;
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              className='mt-4 px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:text-gray-700 hover:border-gray-400 transition-colors'
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            {searchQuery || filteredTech.length <= 7 ? (
              <div className='flex flex-wrap gap-4 justify-center py-6'>
                {filteredTech.map((tech) => (
                  <TechCard key={tech.name} tech={tech} onClick={() => handleTechSelect(tech)} />
                ))}
              </div>
            ) : (
              <div className='relative overflow-hidden py-6'>
                <div className='absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none' />
                <div className='absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none' />

                {row1.length > 0 && (
                  <MarqueeSlider duration={60}>
                    {row1.map((tech) => (
                      <TechCard
                        key={tech.name}
                        tech={tech}
                        onClick={() => handleTechSelect(tech)}
                      />
                    ))}
                  </MarqueeSlider>
                )}
                {row2.length > 0 && (
                  <MarqueeSlider duration={80} reverse>
                    {row2.map((tech) => (
                      <TechCard
                        key={tech.name}
                        tech={tech}
                        onClick={() => handleTechSelect(tech)}
                      />
                    ))}
                  </MarqueeSlider>
                )}
                {row3.length > 0 && (
                  <MarqueeSlider duration={70}>
                    {row3.map((tech) => (
                      <TechCard
                        key={tech.name}
                        tech={tech}
                        onClick={() => handleTechSelect(tech)}
                      />
                    ))}
                  </MarqueeSlider>
                )}
              </div>
            )}
          </>
        )}

        {searchQuery && filteredTech.length > 0 && (
          <div className='text-center mt-4'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Showing {filteredTech.length} of {technologies.length} technologies
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              className='mt-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm'
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Tech Detail Modal */}
      {selectedTech && <TechDetailCard tech={selectedTech} onClose={closeDetail} />}
    </section>
  )
}

interface MarqueeSliderProps {
  children: React.ReactNode
  duration: number
  reverse?: boolean
}
function MarqueeSlider({ children, duration, reverse = false }: MarqueeSliderProps) {
  const [isPaused, setIsPaused] = useState(false)
  const items = React.Children.toArray(children)
  const dup = items.length > 1 ? [...items, ...items, ...items, ...items] : items

  return (
    <div
      className='relative flex overflow-hidden w-full my-8 py-2 h-[90px]'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}
        style={{
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationFillMode: 'forwards',
          animationPlayState: isPaused ? 'paused' : 'running',
          display: 'flex',
          gap: '1rem',
          minWidth: '400%',
          width: 'max-content',
        }}
      >
        {dup.map((child, i) => (
          <div key={i} className='flex-shrink-0 transition-transform duration-300'>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

interface TechCardProps {
  tech: Technology
  onClick: () => void
}
/**
 * Renders a clickable card displaying a technology's icon and name.
 *
 * @param tech - The technology to display.
 * @param onClick - Handler invoked when the card is clicked.
 */
const TechCardComponent: React.FC<TechCardProps> = ({ tech, onClick }) => {
  // Map color names to complete Tailwind classes
  const getCardColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-gray-50 dark:bg-gray-800 border-blue-200 dark:border-blue-800',
      green: 'bg-gray-50 dark:bg-gray-800 border-green-200 dark:border-green-800',
      red: 'bg-gray-50 dark:bg-gray-800 border-red-200 dark:border-red-800',
      yellow: 'bg-gray-50 dark:bg-gray-800 border-yellow-200 dark:border-yellow-800',
      purple: 'bg-gray-50 dark:bg-gray-800 border-purple-200 dark:border-purple-800',
      pink: 'bg-gray-50 dark:bg-gray-800 border-pink-200 dark:border-pink-800',
      indigo: 'bg-gray-50 dark:bg-gray-800 border-indigo-200 dark:border-indigo-800',
      orange: 'bg-gray-50 dark:bg-gray-800 border-orange-200 dark:border-orange-800',
      teal: 'bg-gray-50 dark:bg-gray-800 border-teal-200 dark:border-teal-800',
      cyan: 'bg-gray-50 dark:bg-gray-800 border-cyan-200 dark:border-cyan-800',
      gray: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-800',
    }
    return colorMap[color] || colorMap.gray
  }

  const cardColor = getCardColor(tech.color || 'gray')

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 flex-shrink-0 py-3 px-5 rounded-xl ${cardColor} shadow-md border-2 transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer text-gray-800 dark:text-gray-100`}
    >
      <Image
        width={24}
        height={24}
        src={tech.icon || '/placeholder.svg'}
        alt={`${tech.name} icon`}
        className='w-6 h-6 object-contain'
        loading='lazy'
      />
      <span className='font-semibold whitespace-nowrap'>{tech.name}</span>
    </div>
  )
}

const TechCard = React.memo(TechCardComponent)

interface TechDetailCardProps {
  tech: Technology
  onClose: () => void
}
/**
 * Displays a modal with detailed information about a selected technology.
 *
 * Shows the technology's icon, name, description, experience, learning source, and confidence level, with animated transitions. Includes a button to scroll to the projects section and closes the modal when clicking outside or on the close button.
 *
 * @param tech - The technology object to display details for.
 * @param onClose - Callback to close the modal.
 */
function TechDetailCard({ tech, onClose }: TechDetailCardProps) {
  // Use actual data from database, with fallbacks only if truly missing
  const experience =
    tech.experience ||
    (tech.yearsOfExperience
      ? `${tech.yearsOfExperience}+ year${tech.yearsOfExperience > 1 ? 's' : ''}`
      : 'Experience not specified')
  const learningSource = tech.learningSource || 'Learning source not specified'
  const confidenceLevel = tech.confidenceLevel ?? 0
  const description = tech.description || `${tech.name} is a technology in my stack.`

  // Map color names to gradient backgrounds
  const getHeaderGradient = (color: string) => {
    const gradientMap: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
      green: 'bg-gradient-to-br from-green-500 to-green-600',
      red: 'bg-gradient-to-br from-red-500 to-red-600',
      yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
      pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
      indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
      teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
      cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      gray: 'bg-gradient-to-br from-gray-500 to-gray-600',
    }
    return gradientMap[color] || gradientMap.gray
  }

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({
      behavior: 'smooth',
    })
    onClose()
  }
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative max-w-md w-full rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 border border-white/20 dark:border-gray-700'
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative p-6 pb-4 ${getHeaderGradient(tech.color || 'gray')} text-white`}>
          <Button
            onClick={onClose}
            className='absolute top-4 right-4 p-1 rounded-full bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-800/80 transition-colors'
          >
            <X className='h-5 w-5' />
          </Button>

          <div className='flex items-center gap-4'>
            <div className='p-3 rounded-xl bg-white/30 dark:bg-gray-800/30'>
              <Image
                width={40}
                height={40}
                src={tech.icon || '/placeholder.svg'}
                alt={tech.name}
                className='w-10 h-10 object-contain'
                loading='lazy'
              />
            </div>
            <div>
              <h3 className='text-2xl font-bold'>{tech.name}</h3>
              <p className='text-sm opacity-80'>Technology Details</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='bg-white dark:bg-gray-900 p-6 pt-5'>
          <p className='text-gray-700 dark:text-gray-300 mb-6'>{description}</p>

          <div className='space-y-5'>
            {/* Experience */}
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                <Trophy className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-gray-100'>Experience</h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>{experience}</p>
              </div>
            </div>

            {/* Learning Source */}
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30'>
                <BookOpen className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-gray-100'>Learning Source</h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>{learningSource}</p>
              </div>
            </div>

            {/* Confidence Level */}
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 p-2 rounded-lg bg-green-100 dark:bg-green-900/30'>
                <ChartBar className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
              <div className='flex-1'>
                <h4 className='font-medium text-gray-900 dark:text-gray-100'>Confidence Level</h4>
                <div className='mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5'>
                  <div
                    className='bg-green-600 dark:bg-green-500 h-2.5 rounded-full transition-all duration-300'
                    style={{ width: `${confidenceLevel}%` }}
                  />
                </div>
                <p className='text-xs text-right mt-1 text-gray-600 dark:text-gray-400'>
                  {confidenceLevel}%
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <Button
              onClick={scrollToProjects}
              className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300'
            >
              <ArrowSquareOut className='h-4 w-4' />
              <span>View Projects</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
