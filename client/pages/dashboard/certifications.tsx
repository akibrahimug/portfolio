import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Certificate,
  Clock,
  UploadSimple,
  FileText,
  Download,
  Eye,
  Calendar,
  Trash,
  CheckCircle,
} from '@phosphor-icons/react'
import { httpClient, assetPublicUrl, downloadToDisk } from '@/lib/http-client'
import Link from 'next/link'

const CertificationsPage: React.FC = () => {
  const { getToken, isSignedIn } = useAuth()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Certification state
  const [certifications, setCertifications] = useState<any[]>([])

  // Upload states
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<any | null>(null)

  const MAX_MB = 20
  const ACCEPT = 'application/pdf,.pdf,image/*'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'

  const openPicker = () => inputRef.current?.click()

  const refreshCertifications = useCallback(async () => {
    try {
      const token = await getToken({ template })
      if (!token) throw new Error('Not authenticated')

      const res = await httpClient.browseAssets({}, token)

      if (res.success) {
        // Filter for certification files
        const certificationFiles =
          res.data?.data?.files?.filter((file: any) => file.name.startsWith('certification/')) || []

        // Transform the files to match our certification structure
        const certFiles = certificationFiles.map((file: any) => ({
          _id: file.name.replace(/[^a-zA-Z0-9]/g, '_'), // Create unique ID from filename
          name: file.name.split('/').pop()?.replace(/^\d+-/, '') || file.name, // Remove timestamp prefix
          size: file.size,
          contentType: file.contentType,
          createdAt: file.timeCreated,
          updatedAt: file.updated,
          path: file.name,
          objectPath: file.name,
          publicUrl: file.publicUrl,
          viewUrl: file.viewUrl,
        }))

        setCertifications(certFiles)
      } else {
        console.warn('❌ Failed to load certifications:', res.error)
      }
    } catch (e) {
      console.error('❌ Failed to load certifications', e)
    }
  }, [getToken, template])

  useEffect(() => {
    if (isSignedIn) refreshCertifications()
  }, [isSignedIn, refreshCertifications])

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

      setUploaded(result?.data?.asset)
      setProgress(100)
      await refreshCertifications() // Refresh the list
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(null), 800)
    }
  }

  const handleDelete = async () => {
    try {
      const token = await getToken({ template })
      if (!token) throw new Error('Not authenticated.')

      await refreshCertifications()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete certification')
    }
  }

  const handlePreview = (certification: any) => {
    const url = assetPublicUrl(String(certification.objectPath ?? certification.path ?? ''))
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDownload = async (certification: any) => {
    const url = assetPublicUrl(String(certification.objectPath ?? certification.path ?? ''))
    await downloadToDisk(url, certification.name || 'certification.pdf')
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

        <div className='space-y-4'>
          {certifications.map((cert) => {
            let href = ''
            try {
              href = assetPublicUrl(String(cert.objectPath ?? cert.path ?? ''))
            } catch {
              href = ''
            }

            const isPdf =
              cert.contentType === 'application/pdf' || cert.name.toLowerCase().endsWith('.pdf')

            return (
              <Card className='hover:shadow-lg transition-shadow relative' key={cert._id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                        {isPdf ? (
                          <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                        ) : (
                          <Certificate className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                        )}
                      </div>
                      <div>
                        <CardTitle className='text-lg'>{cert.name}</CardTitle>
                        <div className='flex items-center gap-4 mt-2 '>
                          <Badge variant='secondary'>{isPdf ? 'PDF' : 'Image'}</Badge>
                          <span className='text-xs text-gray-500'>
                            {(cert.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' onClick={() => handleDelete()}>
                        <Trash className='h-4 w-4 mr-2 text-red-500' />
                        Delete
                      </Button>

                      <Link
                        href={href || '#'}
                        className='text-black hover:bg-gray-100 flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1 text-sm font-medium'
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => {
                          if (!href) e.preventDefault()
                          handlePreview(cert)
                        }}
                      >
                        <Eye className='h-4 w-4 mr-2 text-green-500' />
                        Preview
                      </Link>

                      <Button variant='outline' size='sm' onClick={() => handleDownload(cert)}>
                        <Download className='h-4 w-4 mr-2 text-blue-500' />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span>Uploaded: {new Date(cert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-500'>
                      <span>Stored at: {cert.path}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs '>
                      Certification
                    </Badge>
                  </div>

                  {/* Status indicator - similar to resume's public/private indicator */}
                  <span className='bg-gradient-to-t from-blue-400 to-cyan-200 absolute top-0 right-0 h-full w-3 rounded-r-md' />
                </CardContent>
              </Card>
            )
          })}
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
