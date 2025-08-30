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
  // TODO: In the future, load GitHub repos and Vercel projects to populate dropdowns for links

  const projects = projectsData?.items || []

  const addDialog = useDialogState()

  async function handleAddSubmit(formData: any) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')
    const files = extractFiles(formData)
    const uploads: Record<string, string> = {}
    for (const [field, file] of files) {
      const up = await httpClient.uploadAsset(
        file,
        {
          assetType: 'project',
        },
        token,
      )
      if (!up.success) throw new Error(up.error || 'Failed to upload image')
      uploads[field] = up.data?.publicUrl || ''
    }
    const payload: any = { ...formData }
    for (const [field] of files) {
      const targetField = field.endsWith('File') ? field.slice(0, -4) : field
      payload[targetField] = uploads[field]
      delete payload[field]
    }
    await createProject.mutate(payload as any)
    addDialog.close()
    await refetch()
  }
  async function handleEditSubmit(formData: any) {
    const id = (editDialog.data as any)?._id
    if (!id) return
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')
    const files = extractFiles(formData)
    const uploads: Record<string, string> = {}
    for (const [field, file] of files) {
      const up = await httpClient.uploadAsset(file, { assetType: 'technology' }, token)
      if (!up.success) throw new Error(up.error || 'Failed to upload icon')
      uploads[field] = up.data?.publicUrl || ''
    }
    const updates: any = { ...formData }
    for (const [field] of files) {
      const targetField = field.endsWith('File') ? field.slice(0, -4) : field
      updates[targetField] = uploads[field]
      delete updates[field]
    }
    await updateProject.mutate({ id, updates })
    editDialog.close()
    await refetch()
  }

  async function handleDelete(id: string) {
    await deleteProject.mutate(id)
    await refetch()
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
