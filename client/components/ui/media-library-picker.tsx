'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Badge } from './badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { MagnifyingGlass, CloudArrowUp, Folder, File, Check } from '@phosphor-icons/react'
import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import { formatFileSize } from '@/lib/formatters'
import { getFileIcon } from '@/lib/file-utils'
import { useAssetTrackingContext } from '@/contexts/AssetTrackingContext'

interface MediaFile {
  name: string
  size: number
  contentType: string
  timeCreated: string
  updated: string
  publicUrl: string
  viewUrl: string
}

interface MediaLibraryPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (fileUrl: string) => void
  filter?: 'image' | 'all'
  title?: string
  uploadOptions?: { assetType?: string; folder?: string; projectId?: string }
}

export const MediaLibraryPicker: React.FC<MediaLibraryPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  filter = 'all',
  title = 'Select Media',
  uploadOptions,
}) => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const { getAuthToken } = useClerkAuth()

  // Try to get asset tracking context (may not be available in all use cases)
  let trackAsset: ((assetId: string) => void) | null = null
  try {
    const assetTracking = useAssetTrackingContext()
    trackAsset = assetTracking.trackAsset
  } catch {
    // Context not available - no asset tracking needed
  }

  const loadFiles = async (prefix = '') => {
    setLoading(true)
    try {
      const token = await getAuthToken()

      // Build prefix to browse within the assetType folder
      const assetTypePrefix = uploadOptions?.assetType ? `${uploadOptions.assetType}/` : ''
      const fullPrefix = assetTypePrefix + prefix

      const response = await httpClient.browseAssets(
        {
          prefix: fullPrefix,
          limit: 100,
          type: filter === 'image' ? 'image' : undefined,
        },
        token || undefined,
      )

      if (response.success && response.data) {
        setFiles(Array.isArray(response.data.files) ? response.data.files : [])
      } else {
        console.error('Failed to load files:', response.error)
        setFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const loadFolders = async (prefix = '') => {
    try {
      const token = await getAuthToken()

      // Build prefix to browse within the assetType folder
      const assetTypePrefix = uploadOptions?.assetType ? `${uploadOptions.assetType}/` : ''
      const fullPrefix = assetTypePrefix + prefix

      const response = await httpClient.getAssetFolders(fullPrefix, token || undefined)
      if (response.success && response.data) {
        setFolders(Array.isArray(response.data.folders) ? response.data.folders : [])
      } else {
        setFolders([])
      }
    } catch (error) {
      console.error('Error loading folders:', error)
      setFolders([])
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadFiles(currentFolder)
      loadFolders(currentFolder)
    } else {
      // Reset state when dialog closes
      setSelectedFile(null)
      setSearchTerm('')
      setUploadError(null)
      setFolders([])
      setFiles([])
    }
  }, [isOpen, currentFolder, filter])

  const filteredFiles = (Array.isArray(files) ? files : []).filter((file) =>
    (file?.name ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase()),
  )

  const renderFileIcon = (contentType: string) => {
    const iconType = getFileIcon(contentType)
    if (iconType === 'image') {
      return <File className='w-4 h-4 text-blue-500' />
    }
    return <File className='w-4 h-4' />
  }

  const navigateToFolder = (folderPath: string) => {
    setCurrentFolder(folderPath)
    setSelectedFile(null)
  }

  const goBack = () => {
    const parentFolder = currentFolder.split('/').slice(0, -1).join('/')
    setCurrentFolder(parentFolder)
    setSelectedFile(null)
  }

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 z-[70] bg-black/50' />
        <DialogContent
          className='fixed left-[50%] top-[50%] z-[80] grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg duration-200 max-h-[80vh] overflow-hidden'
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col h-full space-y-4'>
            {/* Search and Navigation */}
            <div className='flex items-center space-x-4'>
              <div className='relative flex-1'>
                <MagnifyingGlass className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='Search files...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Breadcrumb navigation */}
              <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                {currentFolder && (
                  <>
                    <Button variant='ghost' size='sm' onClick={() => setCurrentFolder('')}>
                      Root
                    </Button>
                    <span>/</span>
                    {currentFolder.split('/').map((folder, index, array) => (
                      <React.Fragment key={index}>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => navigateToFolder(array.slice(0, index + 1).join('/'))}
                        >
                          {folder}
                        </Button>
                        {index < array.length - 1 && <span>/</span>}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
            </div>

            <Tabs defaultValue='browse' className='flex-1'>
              <TabsList>
                <TabsTrigger value='browse'>Browse</TabsTrigger>
                <TabsTrigger value='upload'>Upload New</TabsTrigger>
              </TabsList>

              <TabsContent value='browse' className='flex-1 overflow-hidden'>
                <div className='h-full flex flex-col'>
                  {/* Folders */}
                  {folders && folders.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='text-sm font-medium mb-2'>Folders</h4>
                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                        {currentFolder && (
                          <div
                            className='flex items-center p-2 border rounded hover:bg-muted cursor-pointer'
                            onClick={goBack}
                          >
                            <Folder className='w-4 h-4 mr-2 text-blue-600' />
                            <span className='text-sm'>.. (Back)</span>
                          </div>
                        )}
                        {(folders || []).map((folder) => (
                          <div
                            key={folder}
                            className='flex items-center p-2 border rounded hover:bg-muted cursor-pointer'
                            onClick={() => navigateToFolder(folder)}
                          >
                            <Folder className='w-4 h-4 mr-2 text-blue-600' />
                            <span className='text-sm truncate'>{folder.split('/').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  <div className='flex-1 overflow-y-auto'>
                    {loading ? (
                      <div className='flex items-center justify-center h-32'>
                        <div className='text-muted-foreground'>Loading files...</div>
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <div className='flex items-center justify-center h-32'>
                        <div className='text-muted-foreground'>
                          {searchTerm
                            ? 'No files found matching your search'
                            : 'No files in this folder'}
                        </div>
                      </div>
                    ) : (
                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                        {filteredFiles.map((file) => (
                          <div
                            key={file.name}
                            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                              selectedFile === file.viewUrl
                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedFile(file.viewUrl)}
                          >
                            {selectedFile === file.viewUrl && (
                              <div className='absolute top-2 right-2 z-10 bg-blue-500 text-white rounded-full p-1'>
                                <Check className='w-3 h-3' />
                              </div>
                            )}

                            {file.contentType.startsWith('image/') ? (
                              <div className='aspect-square bg-gray-100'>
                                <img
                                  src={file.viewUrl}
                                  alt={file.name}
                                  className='w-full h-full object-cover'
                                  loading='lazy'
                                />
                              </div>
                            ) : (
                              <div className='aspect-square bg-gray-100 flex items-center justify-center'>
                                {renderFileIcon(file.contentType)}
                              </div>
                            )}

                            <div className='p-2'>
                              <div className='text-xs font-medium truncate' title={file.name}>
                                {file.name.split('/').pop()}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='upload'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept={filter === 'image' ? 'image/*' : '*/*'}
                      className='hidden'
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadError(null)
                        setUploading(true)
                        try {
                          const token = await getAuthToken()
                          if (!token) throw new Error('Not authenticated')

                          // Step 1: request signed URL
                          const reqRes = await httpClient.requestUpload(
                            {
                              projectId: uploadOptions?.projectId || uploadOptions?.assetType,
                              filename: file.name,
                              contentType: file.type,
                              size: file.size,
                              assetType: uploadOptions?.assetType,
                              ...(uploadOptions?.folder ? { folder: uploadOptions.folder } : {}),
                            },
                            token,
                          )
                          if (!reqRes.success || !reqRes.data) throw new Error(reqRes.error)

                          const { uploadUrl, headers, objectPath } = reqRes.data

                          // Step 2: PUT file to GCS signed URL
                          const putRes = await fetch(uploadUrl, {
                            method: 'PUT',
                            headers,
                            body: file,
                          })
                          if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status}`)

                          // Step 3: confirm upload to persist metadata and get URLs
                          const confirmRes = await httpClient.confirmUpload(
                            {
                              projectId: uploadOptions?.projectId || uploadOptions?.assetType,
                              objectPath,
                              contentType: file.type,
                              size: file.size,
                              assetType: uploadOptions?.assetType,
                            },
                            token,
                          )
                          if (!confirmRes.success || !confirmRes.data)
                            throw new Error(confirmRes.error)

                          // Prefer viewUrl if present, fallback to publicUrl or constructed path
                          const anyData = confirmRes.data as any
                          const finalUrl = anyData.publicUrl || anyData.viewUrl || ''

                          // Track the uploaded asset for potential cleanup
                          if (anyData.assetId && trackAsset) {
                            trackAsset(anyData.assetId)
                          }

                          if (finalUrl) {
                            onSelect(finalUrl)
                            onClose()
                            // Refresh listing
                            loadFiles(currentFolder)
                          }
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : 'Upload failed'
                          console.error(msg)
                          setUploadError(msg)
                        } finally {
                          setUploading(false)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }
                      }}
                    />
                    <Button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className='cursor-pointer'
                    >
                      <CloudArrowUp className='w-4 h-4 mr-2' />
                      {uploading ? 'Uploading...' : 'Choose file'}
                    </Button>
                    {/* TODO: add a component showing the image that was uploaded */}
                    {uploadError && (
                      <span className='text-sm text-red-600'>
                        There was an error uploading your image. Please try again.
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Max size enforced by server; images only if filtered.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className='flex justify-between items-center pt-4 border-t'>
              <div className='text-sm text-muted-foreground'>
                {selectedFile && (
                  <Badge variant='secondary'>
                    {(filteredFiles.find((f) => f.viewUrl === selectedFile)?.name ?? selectedFile)
                      .split('/')
                      .pop()}
                  </Badge>
                )}
              </div>
              <div className='space-x-2'>
                <Button variant='outline' onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSelect} disabled={!selectedFile} className='cursor-pointer'>
                  Select
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
