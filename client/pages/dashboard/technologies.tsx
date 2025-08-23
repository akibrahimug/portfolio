import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/badge'
import { Technology } from '@/lib/schemas'
import { useTechnologies, useCreateTechnologies } from '@/hooks/useHttpApi'

const TechnologiesPage: React.FC = () => {
  const { data: technologiesData, loading, error, refetch } = useTechnologies()
  // TODO: Get real auth token from Clerk when implemented
  const createTechnology = useCreateTechnologies()

  const technologies = technologiesData || []

  const handleAdd = async (formData: any) => {
    try {
      const result = await createTechnology.mutate(formData)
      if (result) {
        refetch() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating technology:', error)
      throw error
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string) => <div className='font-medium'>{value}</div>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <Badge variant='outline' className='capitalize'>
          {value}
        </Badge>
      ),
    },
    {
      key: 'complexity',
      label: 'Complexity',
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
          Beginner: 'secondary',
          Intermediate: 'default',
          Advanced: 'destructive',
        }
        return (
          <Badge variant={variants[value] || 'secondary'} className='capitalize'>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'teamSize',
      label: 'Team Size',
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'flexibility',
      label: 'Flexibility',
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
    {
      key: 'timeToImplement',
      label: 'Implementation Time',
      render: (value: string) => <span className='text-sm'>{value}</span>,
    },
  ]

  return (
    <DashboardLayout currentSection='technologies'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Technologies' }]} />

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading technologies: {error}</p>
        </div>
      )}

      <DataTable
        title='Technologies'
        description='Manage your technical skills and tools'
        data={technologies}
        columns={columns}
        entityType='technology'
        onAdd={handleAdd}
        onView={(id) => {
          const tech = technologies.find((t) => t._id === id)
          if (tech) {
            console.log('Viewing technology:', tech)
          }
        }}
        isLoading={loading}
        addButtonText='Add Technology'
      />
    </DashboardLayout>
  )
}

export default TechnologiesPage
