'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ArrowSquareOut, GithubLogo, CaretDown, CaretUp } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TextToggleProps {
  text: string
  clamp?: number
}

interface Technology {
  techStackID: string | number
  techTitle: string
  pictureUrl?: string
}

interface Project {
  projectID: string | number
  projectTitle: string
  projectDescription: string
  pictureUrl: string
  githubUrl: string
  liveSiteUrl: string
  techStacks?: Technology[]
}

interface ProjectCardProps {
  project: Project
}

function TextToggle({ text, clamp = 3 }: TextToggleProps) {
  const [expanded, setExpanded] = useState<boolean>(false)

  // Ensure we only show the toggle button if the text is long enough to be clamped
  const shouldShowToggle = text.length > 150

  return (
    <div className='space-y-2'>
      <p
        className={cn(
          'text-sm text-muted-foreground transition-all duration-200',
          !expanded &&
            shouldShowToggle &&
            (clamp === 2
              ? 'line-clamp-2'
              : clamp === 3
              ? 'line-clamp-3'
              : clamp === 4
              ? 'line-clamp-4'
              : clamp === 5
              ? 'line-clamp-5'
              : 'line-clamp-3'),
        )}
      >
        {text}
      </p>
      {shouldShowToggle && (
        <button
          type='button'
          onClick={() => setExpanded(!expanded)}
          className='inline-flex items-center text-xs font-medium text-gray-500  transition-colors hover:text-black cursor-pointer'
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <CaretUp className='ml-1 h-3 w-3' />
            </>
          ) : (
            <>
              <span>Show More</span>
              <CaretDown className='ml-1 h-3 w-3' />
            </>
          )}
        </button>
      )}
    </div>
  )
}

/**
 * Displays a project card with image, title, technology stack, expandable description, and links to code and live site.
 *
 * Renders a visually styled card for a given project, including an image, project title, technology badges, a collapsible description, and external links to the project's GitHub repository and live site.
 *
 * @param project - The project data to display in the card.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className=' hover:scale-101 group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md'>
      <div className='relative aspect-video overflow-hidden'>
        <Image
          src={project.pictureUrl || '/placeholder.svg'}
          alt={project.projectTitle}
          className='h-full w-full object-cover '
          loading='lazy'
          width={500}
          height={500}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-gray-200/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </div>

      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-3'>
          <h3 className='font-heading text-xl font-semibold tracking-tight'>
            {project.projectTitle}
          </h3>
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {project.techStacks?.map((tech) => (
              <span
                key={tech.techStackID}
                className='inline-flex items-center rounded-full bg-gray-200 px-4 py-1 text-xs font-medium text-secondary-foreground'
              >
                {tech.techTitle}
              </span>
            ))}
          </div>
        </div>

        <div className='flex-1 pb-12'>
          <TextToggle text={project.projectDescription} />
        </div>

        <div className='absolute bottom-5 left-5 right-5 flex gap-2'>
          <Link
            href={project.githubUrl}
            target='_blank'
            rel='noreferrer'
            className='inline-flex h-9 text-white items-center justify-center rounded-md border bg-black px-3 text-xs font-medium  ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <GithubLogo className='mr-1.5 h-3.5 w-3.5' />
            <span>Code</span>
          </Link>
          <Link
            href={project.liveSiteUrl}
            target='_blank'
            rel='noreferrer'
            className='inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <ArrowSquareOut className='mr-1.5 h-3.5 w-3.5' />
            <span>Live Site</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
