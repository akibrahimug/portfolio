import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
// TODO: Replace DataTable usage with ChatList (implemented below)
import { ChatList } from '@/components/dashboard/ChatList'
import { useMessages, useDeleteMessage } from '@/hooks/useHttpApi'
import { formatDateTime, truncateText } from '@/lib/formatters'
import { useCrudOperations } from '@/hooks/useCrudOperations'

const MessagesPage: React.FC = () => {
  const { data: messagesData, loading, error, refetch } = useMessages()
  // TODO: Get real auth token from Clerk when implemented
  const deleteMessage = useDeleteMessage()

  const messages = messagesData || []

  const { handleDelete } = useCrudOperations({
    entityType: 'message',
    deleteMutation: deleteMessage.mutate,
    onSuccess: refetch,
  })

  // Note: ChatList replaces the previous table view with a conversational list

  return (
    <DashboardLayout currentSection='messages'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Messages' }]} />

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700'>Error loading messages: {error}</p>
        </div>
      )}

      <div className='mb-2'>
        <h1 className='text-xl font-semibold'>Contact Messages</h1>
        <p className='text-sm text-muted-foreground'>Messages received through your contact form</p>
      </div>

      <ChatList
        items={messages as any}
        isLoading={loading}
        onDelete={handleDelete}
        onView={(id) => {
          const message = (messages as any).find((m: any) => m._id === id)
          if (message) {
            // View message functionality would go here
          }
        }}
        renderMeta={(m) => <span>Received {formatDateTime(m.createdAt)}</span>}
      />
    </DashboardLayout>
  )
}

export default MessagesPage
