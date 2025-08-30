/**
 * File and asset related utilities
 */

/**
 * Extract File objects from form data payload
 */
export const extractFiles = (payload: any): Array<[string, File]> => {
  return Object.entries(payload).filter(
    ([_, v]) => typeof File !== 'undefined' && v instanceof File,
  ) as Array<[string, File]>
}

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Check if file is an image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const extension = getFileExtension(filename)
  return imageExtensions.includes(extension)
}

/**
 * Get file icon component based on content type
 */
export const getFileIcon = (contentType: string): string => {
  if (contentType.startsWith('image/')) return 'image'
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('audio/')) return 'audio'
  if (contentType.includes('pdf')) return 'pdf'
  if (contentType.includes('zip') || contentType.includes('rar')) return 'archive'
  if (contentType.includes('sheet') || contentType.includes('excel')) return 'spreadsheet'
  if (contentType.includes('document') || contentType.includes('word')) return 'document'
  return 'file'
}

/**
 * Validate file size (in bytes)
 */
export const validateFileSize = (size: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return size <= maxSizeInBytes
}

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(originalName)
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`
}
