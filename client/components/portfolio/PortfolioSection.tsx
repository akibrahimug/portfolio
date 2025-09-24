import React, { useMemo } from 'react'
import type { PortfolioProject } from '@/types/portfolio'
import { PortfolioCard } from '@/components/portfolio/PortfolioCard'

interface PortfolioSectionProps {
  category: 'AI Learning/Exploration' | 'Frontend/UI/UX' | 'Full Stack' | 'Fun/Sandbox'
  CategoryIcon: React.ElementType
  projects: PortfolioProject[]
  hoveredId: string | null
  onHover: (id: string | null) => void
}

function getGridLayout(category: PortfolioSectionProps['category']): string {
  switch (category) {
    case 'AI Learning/Exploration':
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto'
    case 'Frontend/UI/UX':
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto'
    case 'Full Stack':
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto'
    case 'Fun/Sandbox':
      return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-auto'
    default:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-auto'
  }
}

const PortfolioSectionComponent: React.FC<PortfolioSectionProps> = ({
  category,
  CategoryIcon,
  projects,
  hoveredId,
  onHover,
}) => {
  const gridLayout = useMemo(() => getGridLayout(category), [category])

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex items-center gap-3 mb-4 sm:mb-6'>
        <div className='p-2 sm:p-3 rounded-xl shadow-sm transition-transform duration-300 hover:scale-110 bg-gray-900 dark:bg-white'>
          <CategoryIcon className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
        </div>
        <div>
          <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-500 dark:text-gray-400'>
            {category}
          </h2>
          <div className='h-1 w-16 sm:w-20 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 transition-all duration-300 hover:w-24' />
        </div>
        <div className='flex-1 h-px bg-gray-300 ml-4 sm:ml-8' />
      </div>

      <div className={gridLayout}>
        {projects.map((project) => (
          <PortfolioCard
            key={project.id}
            project={project}
            categoryIcon={CategoryIcon}
            hoveredId={hoveredId}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  )
}

export const PortfolioSection = React.memo(PortfolioSectionComponent)
