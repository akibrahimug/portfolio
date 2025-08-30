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

function getCardSize(projectId: string): string {
  const map: Record<string, string> = {
    'ai-1': 'col-span-1 sm:col-span-2 lg:col-span-3 row-span-3',
    'ai-2': 'col-span-1 sm:col-span-1 lg:col-span-2 row-span-2',
    'ai-3': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
    'fe-1': 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2',
    'fe-2': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-2',
    'fe-3': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
    'fs-1': 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2',
    'fs-2': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-2',
    'fun-1': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
    'fun-2': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
    'fun-3': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-1',
  }
  return map[projectId] || 'col-span-1 row-span-1'
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  categoryIcon: Icon,
  hoveredId,
  onHover,
}) => {
  const isHovered = hoveredId === project.id

  return (
    <div
      className={`${getCardSize(
        project.id,
      )} group relative overflow-hidden rounded-2xl bg-gradient-to-br ${
        project.gradient
      } p-4 sm:p-6 transform transition-all duration-500 cursor-pointer border border-gray-200 
          hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-300/50
          ${isHovered ? 'ring-2 ring-red-400/30 ring-offset-2 ring-offset-gray-50' : ''}`}
      onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

      <div className='absolute inset-0 opacity-5'>
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
        className={`absolute top-2 left-2 w-2 h-2 bg-white/20 rounded-full transition-all duration-500 ${
          isHovered ? 'scale-150 bg-red-400/60' : ''
        }`}
      ></div>
      <div
        className={`absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full transition-all duration-700 ${
          isHovered ? 'scale-200 bg-blue-400/60' : ''
        }`}
      ></div>

      <div
        className='relative z-10 h-full flex flex-col text-white'
        style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}
      >
        <div
          className={`flex items-start justify-between mb-3 sm:mb-4 transition-all duration-300 ${
            isHovered ? 'transform translate-y-[-2px]' : ''
          }`}
        >
          <Icon
            className={`opacity-90 transition-all duration-500 ${
              ['ai-1', 'fs-1'].includes(project.id)
                ? 'w-8 h-8 sm:w-10 sm:h-10'
                : 'w-6 h-6 sm:w-7 sm:h-7'
            }`}
          />
          <div className='flex items-center gap-2'>
            {['ai-1', 'fs-1'].includes(project.id) && (
              <div
                className={`px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold transition-all duration-300 ${
                  isHovered ? 'animate-pulse scale-105 bg-red-400' : ''
                }`}
              >
                Featured
              </div>
            )}
            <div className='flex gap-2'>
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isHovered ? 'animate-ping bg-green-400 scale-150' : 'bg-white/80'
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full transition-all duration-700 ${
                  isHovered ? 'animate-ping bg-blue-400 scale-150' : 'bg-white/60'
                }`}
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>

        <h3
          className={`font-semibold mb-2 sm:mb-3 transition-all duration-500 line-clamp-2 ${
            isHovered ? 'translate-x-2 scale-105' : ''
          } ${
            ['ai-1', 'fs-1'].includes(project.id)
              ? 'text-lg sm:text-xl lg:text-2xl'
              : ['fe-1', 'fun-2'].includes(project.id)
              ? 'text-base sm:text-lg'
              : 'text-sm sm:text-base lg:text-lg'
          }`}
        >
          {project.title}
        </h3>

        {project.hasPreview && (
          <div className='mb-4'>
            <div className='bg-gradient-to-r from-white/10 to-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-500 hover:scale-105'>
              <PreviewContent previewType={project.previewType} />
            </div>
          </div>
        )}

        <p
          className={`text-white/95 mb-3 sm:mb-4 flex-grow leading-relaxed transition-all duration-500 ${
            isHovered ? 'transform scale-[1.02]' : ''
          } ${
            ['ai-1', 'fs-1'].includes(project.id)
              ? 'text-sm sm:text-base line-clamp-4'
              : ['fe-1', 'fun-2'].includes(project.id)
              ? 'text-xs sm:text-sm line-clamp-2'
              : 'text-xs sm:text-sm line-clamp-3'
          }`}
        >
          {project.description}
        </p>

        <div className='mb-3 sm:mb-4'>
          <div className='flex flex-wrap gap-1'>
            {project.techStack
              .slice(0, ['ai-1', 'fs-1'].includes(project.id) ? 5 : 3)
              .map((tech, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 bg-white/25 backdrop-blur-sm rounded-lg text-xs font-medium transition-all duration-500 hover:bg-white/40 border border-white/10 ${
                    isHovered
                      ? 'transform translate-y-[-4px] scale-110 bg-white/35 border-white/30 shadow-lg'
                      : ''
                  }`}
                  style={{ transitionDelay: isHovered ? `${index * 100}ms` : '0ms' }}
                >
                  {tech}
                </span>
              ))}
            {project.techStack.length > (['ai-1', 'fs-1'].includes(project.id) ? 5 : 3) && (
              <span
                className={`px-2 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs border border-white/10 transition-all duration-500 ${
                  isHovered ? 'bg-white/25 scale-105' : ''
                }`}
              >
                +{project.techStack.length - (['ai-1', 'fs-1'].includes(project.id) ? 5 : 3)}
              </span>
            )}
          </div>
        </div>

        <div
          className={`flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs text-white/90 transition-all duration-300 ${
            isHovered ? 'transform translate-x-1' : ''
          }`}
        >
          <div className='flex items-center gap-1 transition-all duration-500'>
            <Clock
              className={`w-3 h-3 transition-all duration-500 ${
                isHovered ? 'rotate-90 scale-125' : ''
              }`}
            />
            <span className='hidden sm:inline'>{project.duration}</span>
            <span className='sm:hidden'>{project.duration.split('-')[0]}</span>
          </div>
          <div className='flex items-center gap-1 transition-all duration-500'>
            <Users
              className={`w-3 h-3 transition-all duration-500 ${isHovered ? 'scale-125' : ''}`}
            />
            <span className='hidden sm:inline'>{project.teamSize}</span>
            <span className='sm:hidden'>
              {project.teamSize.includes('Solo') ? 'Solo' : project.teamSize.charAt(0)}
            </span>
          </div>
        </div>

        <div
          className={`flex gap-2 sm:gap-3 transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-[-2px] scale-105' : 'opacity-90'
          }`}
        >
          <a
            href={project.liveUrl}
            className={`group/button flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 backdrop-blur-sm rounded-lg font-medium transform transition-all duration-300 border relative overflow-hidden ${
              isHovered
                ? 'bg-white/30 border-white/40 scale-105 shadow-lg'
                : 'bg-white/20 border-white/20'
            } text-xs sm:text-sm hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-400 hover:border-transparent hover:scale-110 hover:shadow-xl hover:-translate-y-1 hover:rotate-1`}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-left rounded-lg'></div>
            <ArrowSquareOut
              className={`w-3 h-3 transition-all duration-300 relative z-10 ${
                isHovered ? 'rotate-12 scale-110' : ''
              } group-hover/button:scale-125 group-hover/button:rotate-45`}
            />
            <span className='relative z-10'>Live</span>
          </a>
          <a
            href={project.repoUrl}
            className={`group/button flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 backdrop-blur-sm rounded-lg font-medium transform transition-all duration-300 border relative overflow-hidden ${
              isHovered
                ? 'bg-white/30 border-white/40 scale-105 shadow-lg'
                : 'bg-white/20 border-white/20'
            } text-xs sm:text-sm hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400 hover:border-transparent hover:scale-110 hover:shadow-xl hover:-translate-y-1 hover:-rotate-1`}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-right rounded-lg'></div>
            <GithubLogo
              className={`w-3 h-3 transition-all duration-300 relative z-10 ${
                isHovered ? '-rotate-12 scale-110' : ''
              } group-hover/button:scale-125 group-hover/button:-rotate-45`}
            />
            <span className='relative z-10'>Code</span>
          </a>
        </div>
      </div>

      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
          isHovered
            ? 'bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20 animate-pulse'
            : ''
        }`}
      ></div>
    </div>
  )
}
