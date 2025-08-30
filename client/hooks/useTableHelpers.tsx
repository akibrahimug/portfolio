/**
 * Common table helper functions and components
 */
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/formatters'

// Badge variant mapping
export const getBadgeVariant = (
  value: string,
  mapping: Record<string, 'default' | 'secondary' | 'destructive'>,
): 'default' | 'secondary' | 'destructive' => {
  return mapping[value] || 'secondary'
}

// Common column renderers
export const columnRenderers = {
  status:
    (statusMapping: Record<string, 'default' | 'secondary' | 'destructive'>) => (value: string) =>
      (
        <Badge variant={getBadgeVariant(value, statusMapping)} className='capitalize'>
          {value}
        </Badge>
      ),

  date: (value: string) => formatDate(value),

  dateTime: (value: string) =>
    formatDate(value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),

  techStack: (value: string[], maxDisplay = 2) => (
    <div className='flex flex-wrap gap-1 max-w-[200px]'>
      {value.slice(0, maxDisplay).map((tech, index) => (
        <Badge key={index} variant='secondary' className='text-xs truncate'>
          {tech}
        </Badge>
      ))}
      {value.length > maxDisplay && (
        <Badge variant='secondary' className='text-xs'>
          +{value.length - maxDisplay}
        </Badge>
      )}
    </div>
  ),

  capitalize: (value: string) => (
    <Badge variant='outline' className='capitalize'>
      {value.replace(/_/g, ' ')}
    </Badge>
  ),

  truncate: (value: string, maxLength = 50) => (
    <div className='max-w-[250px] truncate' title={value}>
      {value.length > maxLength ? `${value.substring(0, maxLength)}...` : value}
    </div>
  ),

  titleWithSubtitle: (title: string, subtitle?: string) => (
    <div>
      <div className='font-medium'>{title}</div>
      {subtitle && <div className='text-sm text-gray-500 dark:text-gray-400'>{subtitle}</div>}
    </div>
  ),

  image: (value: string, alt: string = 'image') =>
    value ? (
      <img src={value} alt={alt} className='w-6 h-6 rounded border object-contain bg-white' />
    ) : (
      <span className='text-xs text-muted-foreground'>—</span>
    ),
}

// Status mappings for common entities
export const statusMappings = {
  project: {
    published: 'default',
    draft: 'secondary',
    archived: 'destructive',
  } as const,

  visibility: {
    public: 'default',
    private: 'secondary',
  } as const,

  complexity: {
    Beginner: 'secondary',
    Intermediate: 'default',
    Advanced: 'destructive',
  } as const,
}

// Common table filter function
export const createTableFilter = (searchTerm: string) => (item: any) => {
  const lowercaseSearch = searchTerm.toLowerCase()
  return Object.values(item).some((value) => String(value).toLowerCase().includes(lowercaseSearch))
}

// Sort helpers
export const createSortFunction = <T,>(key: keyof T, order: 'asc' | 'desc' = 'asc') => {
  return (a: T, b: T) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  }
}
