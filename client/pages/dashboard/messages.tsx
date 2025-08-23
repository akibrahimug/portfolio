import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { DataTable } from '@/components/dashboard/DataTable'
import { useMessages, useDeleteMessage } from '@/hooks/useHttpApi'

const MessagesPage: React.FC = () => {
  const { data: messagesData, loading, error, refetch } = useMessages()
  // TODO: Get real auth token from Clerk when implemented
  const deleteMessage = useDeleteMessage()

  const messages = messagesData || []

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteMessage.mutate(id)
      if (result) {
        refetch()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
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
      key: 'email',
      label: 'Email',
      render: (value: string) => <div className='text-sm text-gray-600'>{value}</div>,
    },
    {
      key: 'message',
      label: 'Message',
      render: (value: string) => (
        <div className='max-w-[250px] truncate' title={value}>
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Received',
      render: (value: string) => (
        <div className='text-sm'>
          {new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString()}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout currentSection='messages'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Messages' }]} />

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading messages: {error}</p>
        </div>
      )}

      <DataTable
        title='Contact Messages'
        description='Messages received through your portfolio contact form'
        data={messages}
        columns={columns}
        entityType='message'
        onDelete={handleDelete}
        onView={(id) => {
          const message = messages.find((m) => m._id === id)
          if (message) {
            // For now, just log. In a real app, this could open a detailed view
            console.log('Viewing message:', message)
          }
        }}
        isLoading={loading}
        searchable={true}
      />
    </DashboardLayout>
  )
}

export default MessagesPage
