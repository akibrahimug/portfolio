'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Flask, CaretDown, ChartBar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import methods from '@/lib/methods.json'

// Define the methodology type
type Methodology = {
  name: string
  category: string
  description: string
  complexity: 'Low' | 'Medium' | 'High'
  teamSize: 'Small' | 'Medium' | 'Large' | 'Any'
  flexibility: 'Low' | 'Medium' | 'High'
  timeToImplement: 'Short' | 'Medium' | 'Long'
}

const MethodologiesComponent = () => {
  // State for selected methodologies to compare
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([])
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  // Add state to control dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Memoize methodologies data to prevent unnecessary re-parsing
  const methodologies: Methodology[] = useMemo(() => methods.methods as Methodology[], [])

  // Memoize category colors object
  const categoryColors: Record<string, string> = useMemo(
    () => ({
      process: 'bg-fun-100 text-fun-800',
      principle: 'bg-stack-100 text-stack-800',
      paradigm: 'bg-ai-100 text-ai-800',
      architecture: 'bg-yellow-100 text-yellow-800',
      technology: 'bg-brand-100 text-brand-800',
      design: 'bg-design-100 text-design-800',
    }),
    [],
  )

  // Memoize grouped methodologies to prevent unnecessary re-computation
  const groupedMethodologies = useMemo(() => {
    return methodologies.reduce((acc, methodology) => {
      if (!acc[methodology.category]) {
        acc[methodology.category] = []
      }
      acc[methodology.category].push(methodology)
      return acc
    }, {} as Record<string, typeof methodologies>)
  }, [methodologies])

  // Memoize format category name function
  const formatCategoryName = useCallback((category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }, [])

  // Memoize toggle methodology selection callback
  const toggleMethodologySelection = useCallback((methodologyName: string) => {
    setSelectedMethodologies((prev) => {
      if (prev.includes(methodologyName)) {
        return prev.filter((name) => name !== methodologyName)
      } else {
        // Limit to 3 selections for better UI
        if (prev.length < 3) {
          return [...prev, methodologyName]
        }
        return prev
      }
    })
  }, [])

  // Memoize selected methodology objects computation
  const selectedMethodologyObjects = useMemo(() => {
    return methodologies.filter((m) => selectedMethodologies.includes(m.name))
  }, [methodologies, selectedMethodologies])

  // Memoize compare button click handler
  const handleCompareClick = useCallback(() => {
    if (selectedMethodologies.length >= 2) {
      // Close dropdown before opening dialog to remove underlying overlay
      setDropdownOpen(false)
      setIsCompareDialogOpen(true)
    }
  }, [selectedMethodologies.length])

  // Memoize dialog close handler
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsCompareDialogOpen(open)
  }, [])

  return (
    <div className='m-2 md:mr-10 items-center justify-end'>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger className='group inline-flex items-center gap-2 rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 cursor-pointer transition-all duration-300'>
          <span className='hidden lg:inline-block'>My Methodology</span>
          <Flask className='h-4 w-4' />
          <CaretDown className='h-4 w-4 opacity-50 transition-transform group-data-[state=open]:rotate-180' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-[280px] bg-white dark:bg-gray-800 p-1 shadow-md border border-gray-200 dark:border-gray-700'
        >
          <div className='p-2'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Select to compare ({selectedMethodologies.length}/3)
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={handleCompareClick}
                disabled={selectedMethodologies.length < 2}
                className='h-8 gap-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:border-brand-300 dark:hover:border-brand-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-200 dark:disabled:border-gray-700 cursor-pointer transition-all duration-300'
              >
                <ChartBar className='h-3.5 w-3.5' />
                <span>Compare</span>
              </Button>
            </div>
          </div>
          <DropdownMenuSeparator className='bg-gray-200 dark:bg-gray-700' />
          {Object.entries(groupedMethodologies).map(([category, items], index) => (
            <React.Fragment key={category}>
              {index > 0 && <DropdownMenuSeparator className='bg-gray-200 dark:bg-gray-700' />}
              <DropdownMenuLabel
                className={cn(
                  'text-xs font-medium uppercase tracking-wider px-2',
                  categoryColors[category],
                )}
              >
                {formatCategoryName(category)}
              </DropdownMenuLabel>
              {items.map((methodology, idx) => (
                <DropdownMenuItem
                  key={idx}
                  className='flex cursor-pointer items-center justify-between rounded-md py-1.5 px-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'
                  onSelect={(e) => e.preventDefault()} // Prevent closing dropdown on selection
                >
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id={`methodology-${methodology.name}`}
                      checked={selectedMethodologies.includes(methodology.name)}
                      onCheckedChange={() => toggleMethodologySelection(methodology.name)}
                      className='border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer'
                    />
                    <span>{methodology.name}</span>
                  </div>
                  <Badge
                    variant='outline'
                    className={cn('ml-2 text-xs font-normal border', categoryColors[category])}
                  >
                    {category}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Comparison Dialog */}
      <Dialog open={isCompareDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='max-w-4xl bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold text-gray-700 dark:text-gray-300'>
              Methodology Comparison
            </DialogTitle>
            <DialogDescription className='text-gray-600 dark:text-gray-400'>
              Compare different development methodologies side by side
            </DialogDescription>
          </DialogHeader>

          <div className='mt-4 overflow-x-auto'>
            <MethodologyComparisonTable
              methodologies={selectedMethodologyObjects}
              categoryColors={categoryColors}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Comparison table component
const MethodologyComparisonTableComponent = ({
  methodologies,
  categoryColors,
}: {
  methodologies: Methodology[]
  categoryColors: Record<string, string>
}) => {
  // Memoize comparison criteria
  const criteria = useMemo(
    () => [
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'complexity', label: 'Complexity' },
      { key: 'teamSize', label: 'Team Size' },
      { key: 'flexibility', label: 'Flexibility' },
      { key: 'timeToImplement', label: 'Time to Implement' },
    ],
    [],
  )

  // Memoize helper function to render cell content based on criteria
  const renderCellContent = useCallback(
    (methodology: Methodology, criteriaKey: string) => {
      const value = methodology[criteriaKey as keyof Methodology]

      if (criteriaKey === 'category') {
        return (
          <Badge
            variant='outline'
            className={cn('text-xs font-normal border', categoryColors[value as string])}
          >
            {value}
          </Badge>
        )
      }

      return value
    },
    [categoryColors],
  )

  // Memoize helper function to get background color for complexity, flexibility, etc.
  const getValueColor = useCallback((value: string) => {
    switch (value) {
      case 'Low':
        return 'bg-fun-50 text-fun-700'
      case 'Medium':
        return 'bg-yellow-50 text-yellow-700'
      case 'High':
        return 'bg-brand-50 text-brand-700'
      case 'Short':
        return 'bg-fun-50 text-fun-700'
      case 'Long':
        return 'bg-brand-50 text-brand-700'
      default:
        return ''
    }
  }, [])

  return (
    <div className='w-full'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className='p-2 text-left font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700'>
              Criteria
            </th>
            {methodologies.map((methodology) => (
              <th
                key={methodology.name}
                className='p-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700'
              >
                {methodology.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion) => (
            <tr key={criterion.key} className='border-t border-gray-100 dark:border-gray-700'>
              <td className='p-2 font-medium text-gray-700 dark:text-gray-300'>
                {criterion.label}
              </td>
              {methodologies.map((methodology) => {
                const value = methodology[criterion.key as keyof Methodology] as string
                const valueColor = ['complexity', 'flexibility', 'timeToImplement'].includes(
                  criterion.key,
                )
                  ? getValueColor(value)
                  : ''

                return (
                  <td
                    key={`${methodology.name}-${criterion.key}`}
                    className='p-2 text-gray-700 dark:text-gray-300'
                  >
                    {criterion.key === 'category' ? (
                      renderCellContent(methodology, criterion.key)
                    ) : criterion.key === 'description' ? (
                      <span className='text-sm'>{value}</span>
                    ) : (
                      <span className={cn('px-2 py-1 rounded-full text-xs', valueColor)}>
                        {value}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const MethodologyComparisonTable = React.memo(MethodologyComparisonTableComponent)

const Methodologies = React.memo(MethodologiesComponent)
export default Methodologies
