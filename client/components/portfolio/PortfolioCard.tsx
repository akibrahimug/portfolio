import React from 'react'
import { ArrowSquareOut, GithubLogo, Users, Clock } from '@phosphor-icons/react'
import type { PortfolioProject } from '@/types/portfolio'
import { PreviewContent } from '@/components/portfolio/PreviewContent'

interface PortfolioCardProps {
  project: PortfolioProject
  categoryIcon: React.ElementType
  hoveredId: string | null
  onHover: (id: string | null) => void
}

function getCardSize(project: PortfolioProject): string {
  // Fun/Sandbox cards should all be uniform small size
  if (project.category === 'Fun/Sandbox') {
    return 'col-span-1'
  }

  // For other categories, base size on importance and gradient color
  const hasRedGradient = project.gradient.includes('red')
  const importance = project.importance

  if (importance === 'high' && hasRedGradient) {
    // Biggest cards: high importance + red gradient
    return 'col-span-1 sm:col-span-2 lg:col-span-2'
  } else if (importance === 'high') {
    // Large cards: high importance without red gradient
    return 'col-span-1 sm:col-span-2 lg:col-span-2'
  } else if (importance === 'medium') {
    // Medium cards: medium importance (larger than low, smaller than high)
    return 'col-span-1 sm:col-span-1 lg:col-span-2'
  } else {
    // Small cards: low importance
    return 'col-span-1'
  }
}

const PortfolioCardComponent: React.FC<PortfolioCardProps> = ({
  project,
  categoryIcon: Icon,
  hoveredId,
  onHover,
}) => {
  const isHovered = hoveredId === project.id
  const [isTechExpanded, setIsTechExpanded] = React.useState(false)

  return (
    <div
      className={`${getCardSize(
        project,
      )} group relative overflow-hidden rounded-2xl bg-gradient-to-br min-h-[550px] ${
        project.gradient
      } p-4 sm:p-6 transition-all duration-500 cursor-pointer border border-gray-200
          hover:shadow-2xl hover:shadow-brand-500/20 hover:border-brand-300/50
          ${isHovered ? 'ring-2 ring-brand-400/30 ring-offset-2 ring-offset-gray-50' : ''}`}
      onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none'></div>

      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        <svg
          className={`absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 transition-all duration-700 ${
            isHovered ? 'rotate-12 scale-110 opacity-10' : ''
          }`}
          viewBox='0 0 100 100'
        >
          <circle cx='50' cy='50' r='40' fill='none' stroke='currentColor' strokeWidth='0.5' />
          <circle cx='50' cy='50' r='30' fill='none' stroke='currentColor' strokeWidth='0.5' />
          <circle cx='50' cy='50' r='20' fill='none' stroke='currentColor' strokeWidth='0.5' />
        </svg>
      </div>

      <div
        className={`absolute top-2 left-2 w-2 h-2 bg-white/20 rounded-full transition-all duration-500 pointer-events-none ${
          isHovered ? 'scale-150 bg-brand-400/60' : ''
        }`}
      ></div>
      <div
        className={`absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full transition-all duration-700 pointer-events-none ${
          isHovered ? 'scale-200 bg-stack-400/60' : ''
        }`}
      ></div>

      <div
        className='relative z-10 h-full flex flex-col text-white'
        style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}
      >
        <div
          className={`flex items-start justify-between mb-3 sm:mb-4 transition-all duration-300 ${
            isHovered ? 'brightness-110' : ''
          }`}
        >
          <Icon
            className={`opacity-90 transition-all duration-500 ${
              ['ai-1', 'fs-1'].includes(project.id)
                ? 'w-8 h-8 sm:w-10 sm:h-10'
                : ['ai-2', 'fe-1'].includes(project.id)
                ? 'w-7 h-7 sm:w-8 sm:h-8'
                : 'w-6 h-6 sm:w-7 sm:h-7'
            }`}
          />
          <div className='flex items-center gap-2'>
            {['ai-1', 'ai-2', 'fs-1'].includes(project.id) && (
              <div
                className={`px-2 py-1 bg-brand-500/90 backdrop-blur-sm rounded-full text-xs font-semibold transition-all duration-300 ${
                  isHovered ? 'animate-pulse scale-105 bg-brand-400' : ''
                }`}
              >
                Featured
              </div>
            )}
            <div className='flex gap-2'>
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isHovered ? 'animate-ping bg-fun-400 scale-150' : 'bg-white/80'
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full transition-all duration-700 ${
                  isHovered ? 'animate-ping bg-stack-400 scale-150' : 'bg-white/60'
                }`}
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>

        <h3
          className={`font-semibold mb-2 sm:mb-3 transition-all duration-500 whitespace-nowrap overflow-hidden text-ellipsis text-sm sm:text-base lg:text-lg ${
            isHovered ? 'brightness-110' : ''
          }`}
        >
          {project.title}
        </h3>

        {project.hasPreview && (
          <div className='my-4'>
            <div className='relative bg-gradient-to-r from-white/10 to-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden'>
              <PreviewContent heroImageUrl={project.heroImageUrl} />
            </div>
          </div>
        )}

        <p
          className={`text-white/95 mb-3 sm:mb-4 flex-grow leading-relaxed transition-all duration-500 ${
            isHovered ? 'brightness-105' : ''
          } ${
            ['ai-1', 'fs-1'].includes(project.id)
              ? 'text-sm sm:text-base line-clamp-4'
              : ['ai-2', 'fe-1'].includes(project.id)
              ? 'text-xs sm:text-sm line-clamp-3'
              : ['fun-2'].includes(project.id)
              ? 'text-xs sm:text-sm line-clamp-2'
              : 'text-xs sm:text-sm line-clamp-3'
          }`}
        >
          {project.description}
        </p>

        <div className='mb-3 sm:mb-4'>
          <div className='flex flex-wrap gap-1.5'>
            {(isTechExpanded
              ? project.techStack
              : project.techStack.slice(
                  0,
                  ['ai-1', 'fs-1'].includes(project.id)
                    ? 5
                    : ['ai-2', 'fe-1'].includes(project.id)
                    ? 4
                    : 3,
                )
            ).map((tech, index) => (
              <span
                key={index}
                className={`px-2.5 py-1.5 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-semibold transition-all duration-500 hover:bg-white/45 border border-white/20 shadow-sm ${
                  isHovered ? 'bg-white/40 border-white/35 shadow-md brightness-110' : ''
                }`}
                style={{
                  transitionDelay: isHovered ? `${index * 100}ms` : '0ms',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                {tech}
              </span>
            ))}
            {project.techStack.length >
              (['ai-1', 'fs-1'].includes(project.id)
                ? 5
                : ['ai-2', 'fe-1'].includes(project.id)
                ? 4
                : 3) && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsTechExpanded(!isTechExpanded)
                }}
                className={`px-2.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold border-2 border-white/30 transition-all duration-300 hover:bg-white/35 hover:border-white/50 hover:scale-110 cursor-pointer shadow-sm active:scale-95 ${
                  isHovered ? 'bg-white/30 border-white/40 brightness-110' : ''
                }`}
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                {isTechExpanded
                  ? '✕ Show Less'
                  : `+ ${
                      project.techStack.length -
                      (['ai-1', 'fs-1'].includes(project.id)
                        ? 5
                        : ['ai-2', 'fe-1'].includes(project.id)
                        ? 4
                        : 3)
                    } more`}
              </button>
            )}
          </div>
        </div>

        <div
          className={`flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs transition-all duration-300 ${
            isHovered ? 'brightness-110' : ''
          }`}
        >
          <div
            className={`flex items-center gap-1 transition-all duration-500 ${
              isHovered ? 'text-fun-200' : 'text-white/90'
            }`}
          >
            <Clock
              className={`w-3 h-3 transition-all duration-500 ${
                isHovered
                  ? 'rotate-90 scale-125 text-fun-300 drop-shadow-[0_0_6px_rgba(134,239,172,0.6)]'
                  : 'text-white/90'
              }`}
            />
            <span
              className={`hidden sm:inline transition-colors duration-500 ${
                isHovered ? 'text-fun-200' : 'text-white/90'
              }`}
            >
              {project.duration}
            </span>
            <span
              className={`sm:hidden transition-colors duration-500 ${
                isHovered ? 'text-fun-200' : 'text-white/90'
              }`}
            >
              {project.duration.split('-')[0]}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 transition-all duration-500 ${
              isHovered ? 'text-stack-200' : 'text-white/90'
            }`}
          >
            <Users
              className={`w-3 h-3 transition-all duration-500 ${
                isHovered
                  ? 'scale-125 text-stack-300 drop-shadow-[0_0_6px_rgba(147,197,253,0.5)]'
                  : 'text-white/90'
              }`}
            />
            <span
              className={`hidden sm:inline transition-colors duration-500 ${
                isHovered ? 'text-stack-200' : 'text-white/90'
              }`}
            >
              {project.teamSize}
            </span>
            <span
              className={`sm:hidden transition-colors duration-500 ${
                isHovered ? 'text-stack-200' : 'text-white/90'
              }`}
            >
              {project.teamSize.includes('Solo') ? 'Solo' : project.teamSize.charAt(0)}
            </span>
          </div>
        </div>

        <div
          className={`flex gap-2 sm:gap-3 transition-all duration-500 ${
            isHovered ? 'opacity-100 brightness-110' : 'opacity-90'
          }`}
        >
          <a
            href={project.liveUrl}
            className={`group/button flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 backdrop-blur-sm rounded-lg font-medium transition-all duration-300 border relative overflow-hidden ${
              isHovered
                ? 'bg-white/30 border-white/40 shadow-lg brightness-110'
                : 'bg-white/20 border-white/20'
            } text-xs sm:text-sm hover:bg-gradient-to-r hover:from-fun-400 hover:to-stack-400 hover:border-transparent hover:shadow-xl`}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-fun-400 to-stack-400 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-left rounded-lg'></div>
            <ArrowSquareOut
              className={`w-3 h-3 transition-all duration-300 relative z-10 ${
                isHovered ? 'rotate-12 brightness-110' : ''
              } group-hover/button:rotate-45`}
            />
            <span className='relative z-10'>Live</span>
          </a>
          <a
            href={project.repoUrl}
            className={`group/button flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 backdrop-blur-sm rounded-lg font-medium transition-all duration-300 border relative overflow-hidden ${
              isHovered
                ? 'bg-white/30 border-white/40 shadow-lg brightness-110'
                : 'bg-white/20 border-white/20'
            } text-xs sm:text-sm hover:bg-gradient-to-r hover:from-ai-400 hover:to-design-400 hover:border-transparent hover:shadow-xl`}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-ai-400 to-design-400 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-right rounded-lg'></div>
            <GithubLogo
              className={`w-3 h-3 transition-all duration-300 relative z-10 ${
                isHovered ? '-rotate-12 brightness-110' : ''
              } group-hover/button:-rotate-45`}
            />
            <span className='relative z-10'>Code</span>
          </a>
        </div>
      </div>

      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
          isHovered
            ? 'bg-gradient-to-r from-brand-500/20 via-transparent to-stack-500/20 animate-pulse'
            : ''
        }`}
      ></div>
    </div>
  )
}

export const PortfolioCard = React.memo(PortfolioCardComponent)
