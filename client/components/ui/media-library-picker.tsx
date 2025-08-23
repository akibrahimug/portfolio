'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Badge } from './badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import {
  MagnifyingGlass,
  Upload,
  Folder,
  Image as ImageIcon,
  File,
  X,
  Check,
} from '@phosphor-icons/react'
import { httpClient } from '@/lib/http-client'

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
}

export const MediaLibraryPicker: React.FC<MediaLibraryPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  filter = 'all',
  title = 'Select Media',
}) => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const loadFiles = async (prefix = '') => {
    setLoading(true)
    try {
      const response = await httpClient.browseAssets({
        prefix,
        limit: 100,
        type: filter === 'image' ? 'image' : undefined,
      })

      if (response.success && response.data) {
        setFiles(response.data.files)
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
      const response = await httpClient.getAssetFolders(prefix)
      if (response.success && response.data) {
        setFolders(response.data.folders)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadFiles(currentFolder)
      loadFolders(currentFolder)
    }
  }, [isOpen, currentFolder, filter])

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <ImageIcon className='w-4 h-4' />
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
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
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
                {folders.length > 0 && (
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
                      {folders.map((folder) => (
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
                              {getFileIcon(file.contentType)}
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
              <div className='flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground rounded-lg'>
                <div className='text-center'>
                  <Upload className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground'>
                    Upload functionality will be integrated here
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    TODO: Implement drag & drop upload
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className='flex justify-between items-center pt-4 border-t'>
            <div className='text-sm text-muted-foreground'>
              {selectedFile && (
                <Badge variant='secondary'>
                  {filteredFiles
                    .find((f) => f.viewUrl === selectedFile)
                    ?.name.split('/')
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
    </Dialog>
  )
}
