'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface CardsListAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'destructive'
  icon?: React.ReactNode
}

export interface CardsListField {
  label: React.ReactNode
  value: React.ReactNode
}

export interface CardsListBuildResult {
  key: string
  icon?: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  actions?: CardsListAction[]
  fields?: CardsListField[]
  rightRibbonClass?: string
}

interface CardsListProps<T = any> {
  items: T[]
  isLoading?: boolean
  build: (item: T) => CardsListBuildResult
  empty?: {
    icon?: React.ReactNode
    title: string
    description?: string
    cta?: { label: string; onClick: () => void; icon?: React.ReactNode; disabled?: boolean }
  }
}

export function CardsList<T>({ items, isLoading = false, build, empty }: CardsListProps<T>) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>Loading...</CardContent>
      </Card>
    )
  }

  if (!items?.length) {
    return (
      <Card>
        <CardContent className='text-center py-12'>
          {empty?.icon}
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            {empty?.title || 'No items found'}
          </h3>
          {empty?.description && (
            <p className='text-gray-600 dark:text-gray-400 mb-4'>{empty.description}</p>
          )}
          {empty?.cta && (
            <Button onClick={empty.cta.onClick} disabled={empty.cta.disabled}>
              {empty.cta.icon}
              {empty.cta.label}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4'>
      {items.map((item) => {
        const c = build(item)
        return (
          <Card className='hover:shadow-lg transition-shadow relative' key={c.key}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                    {c.icon}
                  </div>
                  <div>
                    <CardTitle className='text-lg'>{c.title}</CardTitle>
                    {c.meta && <div className='flex items-center gap-4 mt-2'>{c.meta}</div>}
                  </div>
                </div>
                {c.actions && c.actions.length > 0 && (
                  <div className='flex items-center gap-2 flex-wrap justify-end'>
                    {c.actions.map((a, idx) => (
                      <Button
                        key={`${c.key}-action-${idx}`}
                        variant={a.variant || 'outline'}
                        size='sm'
                        onClick={a.onClick}
                      >
                        {a.icon}
                        {a.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            {c.fields && c.fields.length > 0 && (
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                  {c.fields.map((f, i) => (
                    <div key={`${c.key}-field-${i}`} className='flex items-center gap-2 min-w-0'>
                      <span className='text-muted-foreground'>{f.label}</span>
                      <span className='truncate'>{f.value}</span>
                    </div>
                  ))}
                </div>
                {c.rightRibbonClass && (
                  <span
                    className={`${c.rightRibbonClass} absolute top-0 right-0 h-full w-3 rounded-r-md`}
                  />
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default CardsList
