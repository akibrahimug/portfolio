import React, { useState, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Certificate, Clock, UploadSimple } from '@phosphor-icons/react'
import { httpClient } from '@/lib/http-client'

const CertificationsPage: React.FC = () => {
  const { getToken, isSignedIn } = useAuth()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // TODO: Connect to real API when certifications endpoint is implemented
  const certifications: any[] = []

  // Upload states
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<any | null>(null)

  const MAX_MB = 20
  const ACCEPT = 'application/pdf,.pdf,image/*'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'

  const openPicker = () => inputRef.current?.click()

  const doUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const sizeMb = file.size / (1024 * 1024)
      if (sizeMb > MAX_MB) throw new Error(`File too large. Max allowed is ${MAX_MB} MB`)

      const token = await getToken({ template })
      if (!token) throw new Error('Not authenticated.')

      // Upload with certification assetType
      const result = await httpClient.uploadAsset(
        file,
        { assetType: 'certification' },
        token,
        (p) => setProgress(p),
      )
      if (!result.success) throw new Error(result.error || 'Upload failed')

      setUploaded(result.data!.asset)
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(null), 800)
    }
  }

  return (
    <DashboardLayout currentSection='certifications'>
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Certifications' }]}
      />

      {/* Success Modal */}
      {uploaded && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30'>
          <div className='bg-white p-8 rounded-lg shadow-lg max-w-md'>
            <h2 className='text-2xl font-bold mb-4'>Certification Uploaded</h2>
            <p className='text-gray-600 mb-4'>
              Your certification has been uploaded successfully and stored in the certification
              folder.
            </p>
            <Button className='bg-green-500 text-white' onClick={() => setUploaded(null)}>
              <Certificate className='h-4 w-4 mr-2' />
              Close
            </Button>
          </div>
        </div>
      )}

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Certifications</h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage your professional certifications
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <input
              ref={inputRef}
              type='file'
              accept={ACCEPT}
              className='hidden'
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) doUpload(f)
                e.currentTarget.value = ''
              }}
            />
            <Button onClick={openPicker} disabled={uploading || !isSignedIn}>
              <UploadSimple className='h-4 w-4 mr-2' />
              {uploading ? 'Uploading…' : 'Add Certification'}
            </Button>
          </div>
        </div>

        {/* Progress/Error Display */}
        {(progress !== null || error) && (
          <Card>
            <CardContent className='py-4'>
              {error ? (
                <div className='text-red-600 text-sm'>{error}</div>
              ) : (
                <div className='text-sm text-gray-700 dark:text-gray-300'>
                  Uploading… {progress ?? 0}%
                  <div className='w-full bg-gray-200 dark:bg-slate-700 rounded h-2 mt-2'>
                    <div
                      className='h-2 rounded transition-all bg-blue-600'
                      style={{ width: `${progress ?? 0}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {certifications.map((cert) => (
            <Card key={cert._id} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <Certificate className='h-8 w-8 text-blue-600' />
                  <Badge variant={cert.status === 'Active' ? 'default' : 'secondary'}>
                    {cert.status}
                  </Badge>
                </div>
                <CardTitle className='text-lg'>{cert.name}</CardTitle>
                <p className='text-sm text-gray-600 dark:text-gray-400'>{cert.provider}</p>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-500' />
                    <span>Earned: {new Date(cert.earnedDate).toLocaleDateString()}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-500' />
                    <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {certifications.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <Certificate className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No certifications yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Add your professional certifications to showcase your expertise.
              </p>
              <Button onClick={openPicker} disabled={!isSignedIn}>
                <Certificate className='h-4 w-4 mr-2' />
                Add Your First Certification
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default CertificationsPage
