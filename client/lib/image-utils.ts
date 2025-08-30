/**
 * Image handling utilities
 */

/**
 * Handle image error by hiding the image and showing fallback element
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'

  // Show next sibling element if it exists (usually a fallback icon)
  const nextSibling = target.nextElementSibling as HTMLElement
  if (nextSibling) {
    nextSibling.classList.remove('hidden')
  }
}

/**
 * Preload an image
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Check if image URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false

  try {
    const urlObj = new URL(url)
    const validProtocols = ['http:', 'https:', 'data:']
    return validProtocols.includes(urlObj.protocol)
  } catch {
    // If URL constructor throws, it might be a relative path
    return url.startsWith('/') || url.startsWith('./')
  }
}

/**
 * Get image dimensions
 */
export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Convert image to base64
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
