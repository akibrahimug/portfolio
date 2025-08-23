import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, Calendar } from '@phosphor-icons/react'

const ResumesPage: React.FC = () => {
  // TODO: Connect to real API when resumes endpoint is implemented
  const resumes: any[] = []

  return (
    <DashboardLayout currentSection='resumes'>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resumes' }]} />

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Resume Versions</h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage your resume versions and track downloads
            </p>
          </div>
          <Button
            className='cursor-pointer'
            onClick={() => {
              // TODO: Implement resume upload functionality
              console.log('Upload resume functionality coming soon')
            }}
          >
            <FileText className='h-4 w-4 mr-2' />
            Upload New Resume
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-6'>
          {resumes.map((resume) => (
            <Card key={resume._id} className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                      <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>{resume.name}</CardTitle>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        {resume.description}
                      </p>
                      <div className='flex items-center gap-4 mt-2'>
                        <Badge variant={resume.isPublic ? 'default' : 'secondary'}>
                          {resume.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        <span className='text-xs text-gray-500'>v{resume.version}</span>
                        <span className='text-xs text-gray-500'>{resume.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='cursor-pointer'
                      onClick={() => {
                        console.log('Preview functionality coming soon')
                      }}
                    >
                      <Eye className='h-4 w-4 mr-2' />
                      Preview
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='cursor-pointer'
                      onClick={() => {
                        console.log('Download functionality coming soon')
                      }}
                    >
                      <Download className='h-4 w-4 mr-2' />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span>Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Download className='h-4 w-4 text-gray-500' />
                    <span>Downloads: {resume.downloadCount}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-gray-500' />
                    <span>PDF Format</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {resumes.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No resumes uploaded
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Upload your resume to share with potential employers.
              </p>
              <Button
                className='cursor-pointer'
                onClick={() => {
                  // TODO: Implement resume upload functionality
                  console.log('Upload resume functionality coming soon')
                }}
              >
                <FileText className='h-4 w-4 mr-2' />
                Upload Your First Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ResumesPage
