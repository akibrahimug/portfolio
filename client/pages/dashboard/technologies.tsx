import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { CardsList } from '@/components/dashboard/CardsList'
import { Badge } from '@/components/ui/badge'
import {
  useTechnologies,
  useCreateTechnology,
  useUpdateTechnology,
  useDeleteTechnology,
} from '@/hooks/useHttpApi'
import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import { extractFiles } from '@/lib/file-utils'
import { columnRenderers } from '@/hooks/useTableHelpers'
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
import { PencilIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'

const TechnologiesPage: React.FC = () => {
  const { data: technologiesData, loading, error, refetch } = useTechnologies()
  const createTechnology = useCreateTechnology()
  const updateTechnology = useUpdateTechnology()
  const deleteTechnology = useDeleteTechnology()
  const { getAuthToken } = useClerkAuth()

  const technologies = technologiesData || []

  const addDialog = useDialogState()
  const editDialog = useDialogState<any>()

  // Helper to get color classes based on color name
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { badge: string; bg: string }> = {
      blue: { badge: 'bg-blue-100 dark:bg-blue-900', bg: 'bg-blue-100 dark:bg-blue-900' },
      green: { badge: 'bg-green-100 dark:bg-green-900', bg: 'bg-green-100 dark:bg-green-900' },
      red: { badge: 'bg-red-100 dark:bg-red-900', bg: 'bg-red-100 dark:bg-red-900' },
      yellow: { badge: 'bg-yellow-100 dark:bg-yellow-900', bg: 'bg-yellow-100 dark:bg-yellow-900' },
      purple: { badge: 'bg-purple-100 dark:bg-purple-900', bg: 'bg-purple-100 dark:bg-purple-900' },
      pink: { badge: 'bg-pink-100 dark:bg-pink-900', bg: 'bg-pink-100 dark:bg-pink-900' },
      indigo: { badge: 'bg-indigo-100 dark:bg-indigo-900', bg: 'bg-indigo-100 dark:bg-indigo-900' },
      orange: { badge: 'bg-orange-100 dark:bg-orange-900', bg: 'bg-orange-100 dark:bg-orange-900' },
      teal: { badge: 'bg-teal-100 dark:bg-teal-900', bg: 'bg-teal-100 dark:bg-teal-900' },
      cyan: { badge: 'bg-cyan-100 dark:bg-cyan-900', bg: 'bg-cyan-100 dark:bg-cyan-900' },
      gray: { badge: 'bg-gray-100 dark:bg-gray-900', bg: 'bg-gray-100 dark:bg-gray-900' },
    }
    return colorMap[color] || colorMap.gray
  }

  async function handleAddSubmit(formData: any) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')
    const files = extractFiles(formData)
    const uploads: Record<string, string> = {}
    for (const [field, file] of files) {
      const up = await httpClient.uploadAsset(file, { assetType: 'technology' }, token)
      if (!up.success) throw new Error(up.error || 'Failed to upload icon')
      uploads[field] = up.data?.publicUrl || ''
    }
    const payload: any = { ...formData }
    for (const [field] of files) {
      const targetField = field.endsWith('File') ? field.slice(0, -4) : field
      payload[targetField] = uploads[field]
      delete payload[field]
    }
    await createTechnology.mutate(payload)
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
    await updateTechnology.mutate({ id, updates })
    editDialog.close()
    await refetch()
  }

  async function handleDelete(id: string) {
    await deleteTechnology.mutate(id)
    await refetch()
  }
  const buildCard = (item: any) => ({
    key: item._id || item.id,
    icon: columnRenderers.image(item.icon, 'icon'),
    title: (
      <div>
        <div className='font-medium'>{item.name}</div>
      </div>
    ),
    meta: (
      <>
        <Badge variant='outline' className={`p-1 px-2 ${getColorClasses(item.color).badge}`}>
          {item.category}
        </Badge>
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
      {
        label: 'Complexity:',
        value: <span className='text-sm'>{item.complexity}</span>,
      },
      { label: 'Learning Source:', value: <span className='text-sm'>{item.learningSource}</span> },
      {
        label: 'Confidence Level:',
        value: <span className='text-sm'>{item.confidenceLevel}</span>,
      },
      {
        label: 'Color:',
        value: (
          <div
            className={`w-26 h-4 rounded-full ${getColorClasses(item.color).bg}`}
          ></div>
        ),
      },
      {
        label: 'Years of Experience:',
        value: <span className='text-sm'>{item.yearsOfExperience}</span>,
      },
      {
        label: 'Date Added:',
        value: <span className='text-sm'>{columnRenderers.date(item.createdAt)}</span>,
      },
    ],
  })

  return (
    <DashboardLayout currentSection='technologies'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Technologies' }]} />

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading technologies: {error}</p>
        </div>
      )}

      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>Technologies</h1>
          <p className='text-sm text-muted-foreground'>Manage your technical skills and tools</p>
        </div>
        <Button onClick={() => addDialog.open()}>
          <PlusIcon className='w-4 h-4' />
          Add Technology
        </Button>
      </div>

      <CardsList items={technologies} isLoading={loading} build={buildCard} />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(o) => (o ? addDialog.open() : addDialog.close())}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
            <DialogDescription>Fill in the details to add a technology</DialogDescription>
          </DialogHeader>
          <DynamicForm
            formConfig={getFormConfig('technology') || ({} as any)}
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
            <DialogTitle>Edit Technology</DialogTitle>
            <DialogDescription>Update the technology details</DialogDescription>
          </DialogHeader>
          {editDialog.data && (
            <DynamicForm
              formConfig={getFormConfig('technology') || ({} as any)}
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

export default TechnologiesPage
