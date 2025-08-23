import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Certificate, Clock } from '@phosphor-icons/react'

const CertificationsPage: React.FC = () => {
  // TODO: Connect to real API when certifications endpoint is implemented
  const certifications: any[] = []

  return (
    <DashboardLayout currentSection='certifications'>
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Certifications' }]}
      />

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Certifications</h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage your professional certifications
            </p>
          </div>
          <Button
            className='cursor-pointer'
            onClick={() => {
              // TODO: Implement certification upload functionality
              console.log('Upload certification functionality coming soon')
            }}
          >
            <Certificate className='h-4 w-4 mr-2' />
            Add Certification
          </Button>
        </div>

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
              <Button
                className='cursor-pointer'
                onClick={() => {
                  // TODO: Implement certification upload functionality
                  console.log('Upload certification functionality coming soon')
                }}
              >
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
