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

  // Define unique colors for each category using centralized color system
  const getCategoryColor = useMemo(() => {
    switch (category) {
      case 'AI Learning/Exploration':
        return '#a855f7' // Purple for AI (ai-500)
      case 'Frontend/UI/UX':
        return '#ec4899' // Pink for design/UI (design-500)
      case 'Full Stack':
        return '#3b82f6' // Blue for full stack (stack-500)
      case 'Fun/Sandbox':
        return '#22c55e' // Green for fun/games (fun-500)
      default:
        return '#1f2937'
    }
  }, [category])

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex items-center gap-3 mb-4 sm:mb-6'>
        <div
          className='p-2 sm:p-3 rounded-xl shadow-md transition-transform duration-300 hover:scale-110'
          style={{ backgroundColor: getCategoryColor }}
        >
          <CategoryIcon className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
        </div>
        <div>
          <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-400'>
            {category}
          </h2>
          <div className='h-1 w-16 sm:w-20 rounded-full mt-2 transition-all duration-300 hover:w-24' style={{ backgroundColor: getCategoryColor }} />
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
