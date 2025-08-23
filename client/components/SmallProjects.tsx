'use client'

import React, { useState, useMemo } from 'react'
import { AnimatedCardWrapper } from '@/components/AnimatedCardWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectCard } from '@/components/ProjectCard'
import { Pagination } from '@/components/Pagination'
import { useProjects } from '@/hooks/useHttpApi'
interface SmallProjectsProps {
  itemsPerPage?: number
}

const SmallProjects: React.FC<SmallProjectsProps> = ({ itemsPerPage = 6 }) => {
  const { data: projectsData, loading, error } = useProjects()
  const projects = projectsData?.items || []
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Sort and prepare projects for display
  const enrichedProjects = useMemo(() => {
    return projects
      .slice()
      .sort((a, b) => {
        // Sort by creation date if available, otherwise by title
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return (a.title || a.projectTitle || '').localeCompare(b.title || b.projectTitle || '')
      })
      .map((project) => ({
        // Map new API format to ProjectCard expected format
        projectID: project._id,
        projectTitle: project.title || project.projectTitle || '',
        projectDescription: project.description || project.projectDescription || '',
        pictureUrl: project.heroImageUrl || project.pictureUrl || '',
        githubUrl: project.githubUrl || '',
        liveSiteUrl: project.liveSiteUrl || '',
        techStacks:
          project.techStack?.map((tech, index) => ({
            techStackID: index,
            techTitle: tech,
            pictureUrl: undefined,
          })) || [],
      }))
  }, [projects])

  // Calculate pagination values
  const totalPages = Math.ceil(enrichedProjects.length / itemsPerPage)

  // Get current page items
  const currentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return enrichedProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [enrichedProjects, currentPage, itemsPerPage])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of the projects section
    window.scrollTo({ top: 12000, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm'
            >
              <Skeleton className='aspect-video w-full' />
              <div className='p-5 space-y-4'>
                <Skeleton className='h-6 w-3/4' />
                <div className='flex flex-wrap gap-1.5'>
                  <Skeleton className='h-5 w-16 rounded-full' />
                  <Skeleton className='h-5 w-20 rounded-full' />
                  <Skeleton className='h-5 w-14 rounded-full' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
                <div className='flex gap-2 pt-4'>
                  <Skeleton className='h-9 w-20 rounded-md' />
                  <Skeleton className='h-9 w-20 rounded-md' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive'>
          <p>Failed to load projects. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr'>
        {currentProjects.map((project, index) => (
          <AnimatedCardWrapper key={project.projectID} index={index}>
            <ProjectCard project={project} />
          </AnimatedCardWrapper>
        ))}
      </div>

      {/* Pagination */}
      <div className='mt-12'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Page indicator for accessibility */}
      <p className='text-center text-sm text-muted-foreground mt-4'>
        Page {currentPage} of {totalPages} ({enrichedProjects.length} projects)
      </p>
    </div>
  )
}

export default SmallProjects
