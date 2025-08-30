/**
 * Hook for tracking uploaded assets to enable cleanup on form cancel/unmount
 */
import { useState, useCallback, useRef } from 'react'
import { useClerkAuth } from './useClerkAuth'
import { httpClient } from '@/lib/http-client'

export function useAssetTracking() {
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([])
  const { getAuthToken } = useClerkAuth()
  
  // Use ref to track cleanup in progress to prevent double cleanup
  const cleanupInProgress = useRef(false)

  const trackAsset = useCallback((assetId: string) => {
    setUploadedAssets(prev => [...prev, assetId])
  }, [])

  const clearTracking = useCallback(() => {
    setUploadedAssets([])
  }, [])

  const cleanupAssets = useCallback(async () => {
    if (cleanupInProgress.current || uploadedAssets.length === 0) return
    
    cleanupInProgress.current = true
    try {
      const token = await getAuthToken()
      if (!token) return

      await Promise.all(
        uploadedAssets.map(assetId =>
          httpClient.deleteAsset(assetId, token).catch(err =>
            console.warn(`Failed to cleanup asset ${assetId}:`, err)
          )
        )
      )
      setUploadedAssets([])
    } catch (err) {
      console.warn('Failed to cleanup assets:', err)
    } finally {
      cleanupInProgress.current = false
    }
  }, [uploadedAssets, getAuthToken])

  return {
    uploadedAssets,
    trackAsset,
    clearTracking,
    cleanupAssets,
  }
}