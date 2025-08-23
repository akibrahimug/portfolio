'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Function to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pageNumbers = []

    // Always show first page
    pageNumbers.push(1)

    // Calculate range of pages to show around current page
    const rangeStart = Math.max(2, currentPage - 1)
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pageNumbers.push('ellipsis-start')
    }

    // Add pages in the calculated range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i)
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push('ellipsis-end')
    }

    // Always show last page if more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      role='navigation'
      aria-label='Pagination Navigation'
      className={cn('flex justify-center items-center space-x-1', className)}
    >
      {/* Previous button */}
      <Button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-md text-sm',
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-accent hover:text-accent-foreground',
        )}
        aria-label='Go to previous page'
      >
        <CaretLeft className='h-4 w-4' />
      </Button>

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <span
              key={`ellipsis-${index}`}
              className='inline-flex items-center justify-center h-9 w-9'
              aria-hidden='true'
            >
              <DotsThree className='h-4 w-4' />
            </span>
          )
        }

        return (
          <Button
            key={index}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-md text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-black text-white'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        )
      })}

      {/* Next button */}
      <Button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-md text-sm',
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-accent hover:text-accent-foreground',
        )}
        aria-label='Go to next page'
      >
        <CaretRight className='h-4 w-4' />
      </Button>
    </nav>
  )
}
