'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { httpClient, assetPublicUrl, downloadToDisk } from '@/lib/http-client'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  FileText,
  Download,
  Eye,
  Calendar,
  UploadSimple,
  Trash,
  CheckCircle,
} from '@phosphor-icons/react'

export default function ResumesPage() {
  const { getToken, isSignedIn } = useAuth()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<any | null>(null)
  const [resumes, setResumes] = useState<any[]>([])

  const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_RESUME_MB || 20)
  const ACCEPT = 'application/pdf'
  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'

  const openPicker = () => inputRef.current?.click()

  const refreshResumes = React.useCallback(async () => {
    try {
      const res = await httpClient.getResumes()
      if (res.success) setResumes(res.data?.items ?? [])
      else console.warn('Failed to load resumes:', res.error)
    } catch (e) {
      console.error('Failed to load resumes', e)
    }
  }, [])

  useEffect(() => {
    if (isSignedIn) refreshResumes()
  }, [isSignedIn, refreshResumes])

  const doUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const sizeMb = file.size / (1024 * 1024)
      if (sizeMb > MAX_MB) throw new Error(`File too large. Max allowed is ${MAX_MB} MB`)

      const token = await getToken({ template })
      if (!token) throw new Error('Not authenticated.')

      // Single shared upload flow — server requires projectId; client derives it from assetType
      const result = await httpClient.uploadAsset(
        file,
        { assetType: 'resume' }, // projectId auto-derives to 'resume'
        token,
        (p) => setProgress(p),
      )
      if (!result.success) throw new Error(result.error || 'Upload failed')

      setUploaded(result.data!.asset)
      setProgress(100)
      await refreshResumes()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(null), 800)
    }
  }

  const handleDelete = async (id: string) => {
    const token = await getToken({ template })
    if (!token) throw new Error('Not authenticated.')
    const response = await httpClient.deleteResume(id, token)
    if (response.success) await refreshResumes()
  }

  const handlePreview = (id: string) => {
    const r = resumes.find((res) => res._id === id)
    if (!r) return
    const url = assetPublicUrl(String(r.objectPath ?? r.path ?? r.url ?? ''))
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDownload = async (id: string) => {
    const r = resumes.find((res) => res._id === id)
    if (!r) return
    const url = assetPublicUrl(String(r.objectPath ?? r.path ?? r.url ?? ''))
    await downloadToDisk(url, r.name || 'document.pdf')
  }

  const handlePublic = async (id: string) => {
    const current = resumes.find((r) => r._id === id)?.isPublic ?? false
    const next = !current
    setResumes((prev) => prev.map((r) => (r._id === id ? { ...r, isPublic: next } : r)))
    try {
      const token = await getToken({ template })
      if (!token) throw new Error('Not authenticated')
      const resp = await httpClient.editResume(id, { isPublic: next }, token)
      if (!resp.success) throw new Error(resp.error || 'Failed to update resume')
      const updated =
        (resp.data as any)?.resume ?? (resp.data as any)?.item ?? (resp.data as any)?.asset
      if (updated && updated._id) {
        setResumes((prev) => prev.map((r) => (r._id === id ? { ...r, ...updated } : r)))
      }
    } catch (e) {
      // rollback
      setResumes((prev) => prev.map((r) => (r._id === id ? { ...r, isPublic: current } : r)))
      setError(e instanceof Error ? e.message : 'Failed to update resume')
    }
  }

  return (
    <DashboardLayout currentSection='resumes'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resumes' }]} />

      <SignedOut>
        <Card className='max-w-xl mx-auto mt-10'>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <p className='text-sm text-gray-600'>You must sign in to upload your resume.</p>
            <SignInButton mode='modal'>
              <Button>Sign in</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>

      <SignedIn>
        {uploaded && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30'>
            <div className='bg-white p-8 rounded-lg shadow-lg'>
              <h2 className='text-2xl font-bold mb-4'>Resume Uploaded</h2>
              <p className='text-gray-600 mb-4 flex items-center gap-2'>
                Your resume has been uploaded successfully.
                <Button className='bg-green-500 text-white' onClick={() => setUploaded(null)}>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Close
                </Button>
              </p>
            </div>
          </div>
        )}

        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Resume Versions</h1>
              <p className='text-gray-600 dark:text-gray-400'>Upload a PDF resume.</p>
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
              <Button onClick={openPicker} disabled={uploading}>
                <UploadSimple className='h-4 w-4 mr-2' />
                {uploading ? 'Uploading…' : 'Upload New Resume'}
              </Button>
            </div>
          </div>

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

          {Array.isArray(resumes) && resumes.length > 0 ? (
            resumes.map((resume) => {
              let href = ''
              try {
                href = assetPublicUrl(String(resume.objectPath ?? resume.path ?? resume.url ?? ''))
              } catch {}

              return (
                <Card className='hover:shadow-lg transition-shadow relative' key={resume._id}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                          <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div>
                          <CardTitle className='text-lg'>{resume.name}</CardTitle>
                          <div className='flex items-center gap-4 mt-2'>
                            <Badge variant='secondary'>PDF</Badge>
                            <div className='flex items-center gap-2'>
                              <Badge
                                className='cursor-pointer p-1 px-2'
                                onClick={() => handlePublic(resume._id)}
                              >
                                {resume.isPublic ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                            <span className='text-xs text-gray-500'>
                              {(resume.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDelete(resume._id)}
                        >
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
                            handlePreview(resume._id)
                          }}
                        >
                          <Eye className='h-4 w-4 mr-2 text-green-500' />
                          Preview
                        </Link>

                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDownload(resume._id)}
                        >
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
                        <span>Uploaded: {new Date(resume.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-500'>
                        <span>Stored at: {resume.path}</span>
                      </div>
                    </div>

                    <span
                      className={`${
                        resume.isPublic
                          ? 'bg-gradient-to-t from-teal-400 to-yellow-200'
                          : 'bg-gradient-to-t from-red-500 to-orange-500'
                      } absolute top-0 right-0 h-full w-3 rounded-r-md`}
                    />
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className='text-center py-12'>
                <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No resumes uploaded
                </h3>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>
                  Upload your resume to share with potential employers.
                </p>
                <Button onClick={openPicker}>
                  <FileText className='h-4 w-4 mr-2' />
                  Upload Your First Resume
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SignedIn>
    </DashboardLayout>
  )
}
