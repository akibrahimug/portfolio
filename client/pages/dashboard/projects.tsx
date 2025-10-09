import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { CardsList } from '@/components/dashboard/CardsList'
import { Badge } from '@/components/ui/badge'
// import { Project } from '@/lib/schemas'
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
  useTechnologies,
} from '@/hooks/useHttpApi'
import { usePortfolioProjects } from '@/hooks/usePortfolio'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DynamicForm } from '@/components/dashboard/DynamicForm'
import { getFormConfig } from '@/lib/form-configs'
import { useDialogState } from '@/hooks/useDialogState'
import { columnRenderers } from '@/hooks/useTableHelpers'
import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import { extractFiles } from '@/lib/file-utils'
import { PencilIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'

const ProjectsPage: React.FC = () => {
  const { data: projectsData, loading, error, refetch } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const editDialog = useDialogState<any>()
  const { getAuthToken } = useClerkAuth()
  const { data: technologiesData } = useTechnologies()

  // Portfolio projects hook for triggering refetch for the main site
  const { refetch: refetchPortfolioProjects } = usePortfolioProjects()

  // TODO: In the future, load GitHub repos and Vercel projects to populate dropdowns for links

  const projects = projectsData?.items || []
  const addDialog = useDialogState()

  async function handleAddSubmit(formData: any) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')
    const payload: any = { ...formData }

    // Generate slug from title if not provided
    if (!payload.slug && payload.title) {
      payload.slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
    }

    // Ensure proper default values for URLs
    if (!payload.liveUrl) payload.liveUrl = ''
    if (!payload.repoUrl) payload.repoUrl = ''
    if (!payload.githubUrl) payload.githubUrl = ''

    // Set default values for portfolio visibility
    if (!payload.status) payload.status = 'published'
    if (!payload.visibility) payload.visibility = 'public'

    // Log the payload being sent to server
    console.log('📤 Sending payload to server:', payload)

    // Create the project
    let createdProject
    try {
      createdProject = await createProject.mutate(payload as any)
      console.log('✅ Project created successfully:', createdProject)
    } catch (error) {
      console.error('❌ Project creation failed:', error)
      throw error
    }

    addDialog.close()

    // Immediately fetch and display the new project
    await refetch()

    // Also refetch portfolio projects for the main site and log the new project
    await refetchPortfolioProjects()

    // Log the new project data for the projects section
    return createdProject?.project || createdProject
  }
  async function handleEditSubmit(formData: any) {
    try {
      console.log('🔄 Starting project update...', formData)
      const id = (editDialog.data as any)?._id
      if (!id) {
        console.error('❌ No project ID found')
        return
      }
      const token = await getAuthToken()
      if (!token) throw new Error('Not authenticated')
      const updates: any = { ...formData }
      console.log('📝 Project form data being sent:', {
        hasPreview: updates.hasPreview,
        heroImageUrl: updates.heroImageUrl,
        title: updates.title,
        id: id,
      })

      // Update the project
      const updatedProject = await updateProject.mutate({ id, updates })
      console.log('✅ Project updated:', updatedProject)
      editDialog.close()

      // Immediately refresh dashboard
      await refetch()

      // Also refetch portfolio projects for the main site and log the update
      await refetchPortfolioProjects()
    } catch (error) {
      console.error('❌ Project update failed:', error)
      throw error
    }
  }

  async function handleDelete(id: string) {
    await deleteProject.mutate(id)

    // Immediately refresh dashboard
    await refetch()

    // Also refetch portfolio projects for the main site and log the deletion
    await refetchPortfolioProjects()
  }

  const buildCard = (item: any) => ({
    key: item._id || item.id,
    icon: null,
    title: columnRenderers.titleWithSubtitle(item.title),
    meta: (
      <>
        {item.category && (
          <Badge variant='outline' className='capitalize'>
            {String(item.category)}
          </Badge>
        )}
      </>
    ),
    actions: [
      {
        label: 'Edit',
        icon: <PencilIcon className='w-4 h-4 text-blue-500' />,
        onClick: () => editDialog.open(item),
      },
      {
        label: 'Delete',
        icon: <TrashIcon className='w-4 h-4 text-red-500' />,

        onClick: () => handleDelete(item._id || item.id),
      },
    ],
    fields: [
      { label: 'Visibility:', value: item.visibility },
      { label: 'Tech Stack:', value: columnRenderers.techStack(item.techStack || [], 2) },
      { label: 'Last Updated:', value: columnRenderers.date(item.updatedAt) },
    ],
  })

  return (
    <DashboardLayout currentSection='projects'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Projects' }]} />

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading projects: {error}</p>
        </div>
      )}

      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>Projects</h1>
          <p className='text-sm text-muted-foreground'>Manage your portfolio projects</p>
        </div>
        <Button onClick={() => addDialog.open()}>
          <PlusIcon className='w-4 h-4' />
          Add Project
        </Button>
      </div>
      <CardsList items={projects} isLoading={loading} build={buildCard} />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(o) => (o ? addDialog.open() : addDialog.close())}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
            <DialogDescription>Create a new project</DialogDescription>
          </DialogHeader>
          <DynamicForm
            formConfig={
              {
                ...(getFormConfig('project') || ({} as any)),
                // For now, keep links as free-form URL inputs
                // TODO: Replace with selects populated from GitHub/Vercel integrations
                fields: (getFormConfig('project') || ({} as any)).fields.map((f: any) => {
                  if (f.name === 'techStack') {
                    return {
                      ...f,
                      options:
                        technologiesData?.map((t: any) => ({ label: t.name, value: t.name })) ||
                        f.options,
                    }
                  }
                  // Keep existing options for gradient; list is static from codebase
                  return f
                }),
              } as any
            }
            onSubmit={handleAddSubmit}
            onCancel={() => addDialog.close()}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(o) => (o ? editDialog.open(editDialog.data) : editDialog.close())}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update the project details</DialogDescription>
          </DialogHeader>
          {editDialog.data && (
            <DynamicForm
              formConfig={
                {
                  ...(getFormConfig('project') || ({} as any)),
                  // For now, keep links as free-form URL inputs
                  // TODO: Replace with selects populated from GitHub/Vercel integrations
                  fields: (getFormConfig('project') || ({} as any)).fields.map((f: any) => {
                    if (f.name === 'techStack') {
                      return {
                        ...f,
                        options:
                          technologiesData?.map((t: any) => ({ label: t.name, value: t.name })) ||
                          f.options,
                      }
                    }
                    return f
                  }),
                } as any
              }
              defaultValues={editDialog.data}
              onSubmit={handleEditSubmit}
              onCancel={() => editDialog.close()}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default ProjectsPage
