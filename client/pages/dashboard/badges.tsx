import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Medal, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface BadgeFile {
  _id: string
  name: string
  size: number
  contentType: string
  timeCreated: string
  updated: string
  objectPath: string
  publicUrl: string
  viewUrl: string
}

const BadgesPage: React.FC = () => {
  const { getAuthToken } = useClerkAuth()
  const { isLoaded, isSignedIn } = useUser()
  const [badges, setBadges] = React.useState<BadgeFile[]>([])
  const [loading, setLoading] = React.useState(false)
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [cacheTimestamp, setCacheTimestamp] = React.useState<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const bulkFileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  const refreshBadges = React.useCallback(
    async (forceFetch = false, page = 1) => {
      console.log('[BADGES CLIENT] refreshBadges called - forceFetch:', forceFetch, 'page:', page)

      // Check cache validity
      const now = Date.now()
      const isCacheValid = cacheTimestamp && now - cacheTimestamp < CACHE_DURATION

      if (!forceFetch && isCacheValid && badges.length > 0) {
        console.log('📦 Using cached badges data')
        return
      }

      setLoading(true)
      try {
        const token = await getAuthToken()
        if (!token) {
          console.warn('No authentication token available, user may not be signed in')
          setLoading(false)
          return
        }
        const res = await httpClient.getBadges(token, page, pagination.limit)

        if (res.success && res.data) {
          // Handle nested data structure: res.data.data.badges
          const responseData = (res.data as any).data || res.data
          const badgesData = (responseData.badges as unknown as BadgeFile[]) || []

          if (page === 1) {
            setBadges(badgesData)
          } else {
            setBadges((prev) => [...prev, ...badgesData])
          }

          setPagination({
            page: responseData.page,
            limit: responseData.limit,
            total: responseData.total,
            hasMore: responseData.hasMore,
            totalPages: responseData.totalPages,
          })

          setCacheTimestamp(now)
        } else {
          console.warn('Failed to load badges:', res.error)
        }
      } catch (e) {
        console.error('Failed to load badges', e)
      } finally {
        setLoading(false)
      }
    },
    [getAuthToken, cacheTimestamp, badges.length, pagination.limit],
  )

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshBadges()
    }
  }, [isLoaded, isSignedIn])

  async function handleUpload(file: File) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')

    setLoading(true)
    try {
      const up = await httpClient.uploadAsset(file, { assetType: 'badge' }, token)
      if (!up.success) throw new Error(up.error || 'Failed to upload badge')
      await refreshBadges(true) // Force fetch after single upload
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkUpload(files: FileList) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')

    setLoading(true)
    try {
      const uploadPromises = Array.from(files).map((file) =>
        httpClient.uploadAsset(file, { assetType: 'badge' }, token),
      )

      const results = await Promise.allSettled(uploadPromises)

      // Count successful uploads
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.success,
      ).length

      const failed = results.length - successful

      if (failed > 0) {
        console.warn(`${successful} badges uploaded successfully, ${failed} failed`)
      }

      // Only refresh once after all uploads are complete
      await refreshBadges(true) // Force fetch to get latest data
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(badge: BadgeFile) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')

    try {
      // Extract filename from objectPath
      const filename = badge.objectPath.split('/').pop()
      if (!filename) throw new Error('Invalid badge path')

      const response = await httpClient.deleteBadge(filename, token)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete badge')
      }

      await refreshBadges(true) // Force fetch after delete
    } catch (error) {
      console.error('Delete failed:', error)
      throw error
    }
  }

  // Badges currently stored as uploaded images under media/badges/* in GCS via assets endpoints

  return (
    <DashboardLayout currentSection='badges'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Badges' }]} />

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Badges & Achievements
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Your professional accomplishments and recognition
            </p>
            {badges.length > 0 && (
              <p className='text-sm text-gray-500 mt-1'>
                Showing {badges.length} of {pagination.total} badges
              </p>
            )}
          </div>
          <div className='flex gap-2'>
            <Button className='cursor-pointer' onClick={() => fileInputRef.current?.click()}>
              <Medal className='h-4 w-4 mr-2' />
              Add Badge
            </Button>
            <Button
              variant='outline'
              className='cursor-pointer'
              onClick={() => bulkFileInputRef.current?.click()}
            >
              <Medal className='h-4 w-4 mr-2' />
              Bulk Upload
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={async (e) => {
              const inputEl = e.currentTarget
              const file = inputEl.files?.[0]
              if (file) {
                await handleUpload(file)
                inputEl.value = ''
              }
            }}
          />
          <input
            ref={bulkFileInputRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={async (e) => {
              const inputEl = e.currentTarget
              const files = inputEl.files
              if (files && files.length > 0) {
                await handleBulkUpload(files)
                inputEl.value = ''
              }
            }}
          />
        </div>

        <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6'>
          {badges.map((badge) => (
            <Card
              key={badge._id}
              className=' w-full min-w-[300px] hover:shadow-lg transition-shadow overflow-hidden group bg-gray-100'
            >
              <CardHeader className='pb-2 relative px-0'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 z-10'
                  onClick={() => handleDelete(badge)}
                >
                  <Trash className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent className='px-0 pb-6'>
                <div className='w-full h-48 flex items-center justify-center  rounded-lg mb-3'>
                  <Image
                    src={badge.publicUrl}
                    alt={badge.name}
                    className='max-w-full max-h-full object-cover'
                    width={500}
                    height={500}
                    loading='lazy'
                  />
                </div>
                <div className='space-y-1 text-xs text-gray-500 px-6'>
                  <p>Size: {(badge.size / 1024).toFixed(1)} KB</p>
                  <p>Uploaded: {new Date(badge.timeCreated).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasMore && !loading && (
          <div className='text-center py-6'>
            <Button
              variant='outline'
              onClick={() => refreshBadges(true, pagination.page + 1)}
              disabled={loading}
            >
              Load More Badges ({pagination.total - badges.length} remaining)
            </Button>
          </div>
        )}

        {loading && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>Loading badges...</p>
          </div>
        )}

        {!loading && badges.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <Medal className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No badges yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Upload your TreeHouse badges and other achievement images.
              </p>
              <Button className='cursor-pointer' onClick={() => fileInputRef.current?.click()}>
                <Medal className='h-4 w-4 mr-2' />
                Add Your First Badge
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BadgesPage
