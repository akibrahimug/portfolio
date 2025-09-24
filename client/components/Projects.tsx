import React, { useMemo, useState, useCallback } from 'react'
import { Brain, Palette, Database, GameController } from '@phosphor-icons/react'
import { usePortfolioProjects } from '@/hooks/usePortfolio'
import type { PortfolioCategoryMap } from '@/types/portfolio'
import { PortfolioSection } from '@/components/portfolio/PortfolioSection'

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
        {!loading &&
          data &&
          categories.map((category) => (
            <PortfolioSection
              key={category}
              category={category}
              CategoryIcon={categoryIcons[category]}
              projects={data[category]}
              hoveredId={hoveredCard}
              onHover={handleHover}
            />
          ))}
      </div>
    </div>
  )
}

const Projects = React.memo(ProjectsComponent)
export default Projects
