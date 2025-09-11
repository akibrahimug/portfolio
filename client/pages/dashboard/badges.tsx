import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Medal } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'

const BadgesPage: React.FC = () => {
  const { getAuthToken } = useClerkAuth()
  const [badges, setBadges] = React.useState<Array<{ publicUrl: string; name: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const refreshBadges = React.useCallback(async () => {
    try {
      const res = await httpClient.getBadges()
      console.log('res', res)
      if (res.success) setBadges(res)
      else console.warn('Failed to load badges:', res.error)
    } catch (e) {
      console.error('Failed to load badges', e)
    }
  }, [])

  async function handleUpload(file: File) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')
    const up = await httpClient.uploadAsset(file, { assetType: 'badge' }, token)
    if (!up.success) throw new Error(up.error || 'Failed to upload badge')
    await refreshBadges()
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
          </div>
          <Button className='cursor-pointer' onClick={() => fileInputRef.current?.click()}>
            <Medal className='h-4 w-4 mr-2' />
            Add Badge
          </Button>
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
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {badges.map((badge) => (
            <Card key={badge.name} className='hover:shadow-lg transition-shadow overflow-hidden'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm truncate'>{badge.name.split('/').pop()}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={badge.publicUrl}
                  alt={badge.name}
                  className='w-full h-40 object-contain bg-white rounded border'
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && badges.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <Medal className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No badges yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Earn badges by completing achievements and milestones.
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
