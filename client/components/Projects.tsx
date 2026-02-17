import React, { useMemo, useState, useCallback } from 'react'
import { Brain, Palette, Database, GameController } from '@phosphor-icons/react'
import { usePortfolioProjects } from '@/hooks/usePortfolio'
import type { PortfolioCategoryMap } from '@/types/portfolio'
import { PortfolioSection } from '@/components/portfolio/PortfolioSection'
import { Skeleton } from '@/components/ui/skeleton'

const categoryIcons: Record<keyof PortfolioCategoryMap, React.ElementType> = {
  'AI Learning/Exploration': Brain,
  'Frontend/UI/UX': Palette,
  'Full Stack': Database,
  'Fun/Sandbox': GameController,
}

const ProjectsComponent: React.FC = () => {
  const { data, loading, error } = usePortfolioProjects()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const categories = useMemo(
    () => (data ? (Object.keys(data) as (keyof PortfolioCategoryMap)[]) : []),
    [data],
  )

  const handleHover = useCallback((cardId: string | null) => {
    setHoveredCard(cardId)
  }, [])

  return (
    <div id='projects' className='min-h-screen p-4 sm:p-6 lg:p-8'>
      <div className='text-center mb-8 sm:mb-12'>
        <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-500 dark:text-gray-400 mb-4'>
          Projects
        </h1>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-6'>
          Exploring the intersection of creativity and technology through innovative projects
        </p>
      </div>

      {error && (
        <div className='max-w-6xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading content: {error}</p>
        </div>
      )}

      <div className='max-w-6xl mx-auto space-y-8 sm:space-y-12'>
        {loading ? (
          // Skeleton loading state
          <>
            {[1, 2, 3].map((section) => (
              <div key={section} className='space-y-4 sm:space-y-6'>
                {/* Section header skeleton */}
                <div className='flex items-center gap-3 mb-4 sm:mb-6'>
                  <Skeleton className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl' />
                  <div>
                    <Skeleton className='h-6 sm:h-8 w-40 sm:w-52' />
                    <Skeleton className='h-1 w-16 sm:w-20 rounded-full mt-2' />
                  </div>
                  <div className='flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-4 sm:ml-8' />
                </div>

                {/* Project cards skeleton grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className='rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
                      >
                        {/* Image skeleton */}
                        <Skeleton className='w-full h-40 sm:h-48 rounded-none' />
                        {/* Content skeleton */}
                        <div className='p-4 space-y-3'>
                          <Skeleton className='h-5 w-3/4' />
                          <Skeleton className='h-4 w-full' />
                          <Skeleton className='h-4 w-2/3' />
                          {/* Tags skeleton */}
                          <div className='flex gap-2 pt-2'>
                            <Skeleton className='h-6 w-16 rounded-full' />
                            <Skeleton className='h-6 w-20 rounded-full' />
                            <Skeleton className='h-6 w-14 rounded-full' />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          data &&
          categories.map((category) => {
            const projects = data[category]
            // Only render section if it has projects
            if (!projects || projects.length === 0) return null

            return (
              <PortfolioSection
                key={category}
                category={category}
                CategoryIcon={categoryIcons[category]}
                projects={projects}
                hoveredId={hoveredCard}
                onHover={handleHover}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

const Projects = React.memo(ProjectsComponent)
export default Projects
