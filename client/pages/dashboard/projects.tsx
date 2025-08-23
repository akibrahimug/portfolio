import React, { useState } from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Project } from '@/lib/schemas'
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useHttpApi'

const ProjectsPage: React.FC = () => {
  const { data: projectsData, loading, error, refetch } = useProjects()
  const createProject = useCreateProject()
  // TODO: Get real auth token from Clerk when implemented
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const projects = projectsData?.items || []

  const handleAdd = async (formData: any) => {
    try {
      const result = await createProject.mutate(formData)
      if (result) {
        refetch() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  const handleEdit = async (id: string, formData: any) => {
    try {
      const result = await updateProject.mutate({ id, updates: formData })
      if (result) {
        refetch()
      }
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteProject.mutate(id)
      if (result) {
        refetch()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: Project) => (
        <div>
          <div className='font-medium'>{value}</div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>{row.slug}</div>
        </div>
      ),
    },
    {
      key: 'kind',
      label: 'Type',
      render: (value: string) => (
        <Badge variant='outline' className='capitalize'>
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
          published: 'default',
          draft: 'secondary',
          archived: 'destructive',
        }
        return (
          <Badge variant={variants[value] || 'secondary'} className='capitalize'>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'visibility',
      label: 'Visibility',
      render: (value: string) => (
        <Badge variant={value === 'public' ? 'default' : 'secondary'} className='capitalize'>
          {value}
        </Badge>
      ),
    },
    {
      key: 'techStack',
      label: 'Tech Stack',
      render: (value: string[]) => (
        <div className='flex flex-wrap gap-1 max-w-[200px]'>
          {value.slice(0, 2).map((tech, index) => (
            <Badge key={index} variant='secondary' className='text-xs truncate'>
              {tech}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  return (
    <DashboardLayout currentSection='projects'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Projects' }]} />

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading projects: {error}</p>
        </div>
      )}

      <DataTable
        title='Projects'
        description='Manage your portfolio projects'
        data={projects}
        columns={columns}
        entityType='project'
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
        addButtonText='Add Project'
      />
    </DashboardLayout>
  )
}

export default ProjectsPage
