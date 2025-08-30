import React, { useMemo, useState } from 'react'
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

const Projects: React.FC = () => {
  const { data, loading, error } = usePortfolioProjects()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const categories = useMemo(
    () => (data ? (Object.keys(data) as (keyof PortfolioCategoryMap)[]) : []),
    [data],
  )

  return (
    <div id='projects' className='min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8'>
      <div className='text-center mb-8 sm:mb-12'>
        <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4'>
          Project Portfolio
        </h1>
        <p className='text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4'>
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
              onHover={setHoveredCard}
            />
          ))}
      </div>

      <div className='text-center mt-16 py-8'>
        <p className='text-gray-600'>Built with React, Tailwind CSS, and lots of ☕</p>
      </div>
    </div>
  )
}

export default Projects
