import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'

const AvatarsPage: React.FC = () => {
  const { getAuthToken } = useClerkAuth()
  const [avatars, setAvatars] = React.useState<Array<{ publicUrl: string; name: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  async function fetchAvatars() {
    try {
      setLoading(true)
      const token = await getAuthToken()
      if (!token) throw new Error('Not authenticated')
      const resp = await httpClient.browseAssets({ prefix: 'avatar' }, token)
      if (resp.success) {
        const files = (resp.data as any)?.files || []
        setAvatars(files.map((f: any) => ({ publicUrl: f.publicUrl, name: f.name })))
      }
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAvatars()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleUpload(file: File) {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')
    const up = await httpClient.uploadAsset(file, { assetType: 'avatar' }, token)
    if (!up.success) throw new Error(up.error || 'Failed to upload avatar')
    await fetchAvatars()
  }

  return (
    <DashboardLayout currentSection='avatars'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Avatars' }]} />

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Avatar Images</h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Profile pictures and avatar images for your portfolio
            </p>
          </div>
          <Button className='cursor-pointer' onClick={() => fileInputRef.current?.click()}>
            <User className='h-4 w-4 mr-2' />
            Add Avatar
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
          {avatars.map((avatar) => (
            <Card key={avatar.name} className='hover:shadow-lg transition-shadow overflow-hidden'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm truncate'>{avatar.name.split('/').pop()}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={avatar.publicUrl}
                  alt={avatar.name}
                  className='w-full h-40 object-cover bg-gray-100 rounded border'
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && avatars.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No avatars yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Upload profile pictures and avatar images for your portfolio.
              </p>
              <Button className='cursor-pointer' onClick={() => fileInputRef.current?.click()}>
                <User className='h-4 w-4 mr-2' />
                Add Your First Avatar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AvatarsPage
