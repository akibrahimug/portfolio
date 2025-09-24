/**
 * Context for sharing asset tracking between form components
 */
import React, { createContext, useContext, useMemo } from 'react'
import { useAssetTracking } from '@/hooks/useAssetTracking'

interface AssetTrackingContextType {
  trackAsset: (assetId: string) => void
  clearTracking: () => void
  cleanupAssets: () => Promise<void>
  uploadedAssets: string[]
}

const AssetTrackingContext = createContext<AssetTrackingContextType | null>(null)

export function AssetTrackingProvider({ children }: { children: React.ReactNode }) {
  const assetTracking = useAssetTracking()

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => assetTracking, [
    assetTracking.trackAsset,
    assetTracking.clearTracking,
    assetTracking.cleanupAssets,
    assetTracking.uploadedAssets,
  ])

  return (
    <AssetTrackingContext.Provider value={contextValue}>
      {children}
    </AssetTrackingContext.Provider>
  )
}

export function useAssetTrackingContext() {
  const context = useContext(AssetTrackingContext)
  if (!context) {
    throw new Error('useAssetTrackingContext must be used within AssetTrackingProvider')
  }
  return context
}