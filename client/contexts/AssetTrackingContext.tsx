/**
 * Context for sharing asset tracking between form components
 */
import React, { createContext, useContext } from 'react'
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

  return (
    <AssetTrackingContext.Provider value={assetTracking}>
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