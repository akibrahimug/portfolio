/**
 * Centralized formatting utilities
 */

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date string to locale date string
 */
export const formatDate = (
  dateStr: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format date for display (with time)
 */
export const formatDateTime = (dateStr: string | Date): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

/**
 * Format month-year date (YYYY-MM format)
 */
export const formatMonthYear = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr + '-01')
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

/**
 * Calculate duration between two dates
 */
export const calculateDuration = (start: string, end?: string): string => {
  const startDate = new Date(start + '-01')
  const endDate = end ? new Date(end + '-01') : new Date()

  const diffInMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())

  const years = Math.floor(diffInMonths / 12)
  const months = diffInMonths % 12

  if (years === 0) {
    return `${months} ${months === 1 ? 'mo' : 'mos'}`
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'yr' : 'yrs'}`
  } else {
    return `${years} ${years === 1 ? 'yr' : 'yrs'} ${months} ${months === 1 ? 'mo' : 'mos'}`
  }
}

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Convert string to slug
 */
export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}
