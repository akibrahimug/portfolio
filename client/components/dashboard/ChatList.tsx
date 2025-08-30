'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface ChatMessageItem {
  _id: string
  name: string
  email: string
  message: string
  createdAt: string
}

interface ChatListProps {
  items: ChatMessageItem[]
  isLoading?: boolean
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  renderMeta?: (item: ChatMessageItem) => React.ReactNode
}

export const ChatList: React.FC<ChatListProps> = ({
  items,
  isLoading = false,
  onDelete,
  onView,
  renderMeta,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>Loading…</CardContent>
      </Card>
    )
  }

  if (!items?.length) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-sm text-muted-foreground'>
          No messages yet
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    const parts = String(name || '')
      .split(' ')
      .filter(Boolean)
    return (
      parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || '?'
    )
  }

  return (
    <div className='space-y-3'>
      {items.map((m) => (
        <div key={m._id} className='flex gap-3 items-start'>
          <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold'>
            {getInitials(m.name)}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between gap-3'>
              <div className='min-w-0'>
                <div className='font-medium truncate'>{m.name}</div>
                <div className='text-xs text-muted-foreground truncate'>{m.email}</div>
              </div>
              <div className='shrink-0 flex gap-2'>
                {onView && (
                  <Button size='sm' variant='outline' onClick={() => onView(m._id)}>
                    View
                  </Button>
                )}
                {onDelete && (
                  <Button size='sm' variant='destructive' onClick={() => onDelete(m._id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
            <div className='mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap line-clamp-3'>
              {m.message}
            </div>
            {renderMeta && (
              <div className='mt-1 text-xs text-muted-foreground'>{renderMeta(m)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatList
