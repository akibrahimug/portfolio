import React from 'react'
import { DashboardLayout, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Medal, Star } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

const BadgesPage: React.FC = () => {
  // TODO: Connect to real API when badges endpoint is implemented
  const badges: any[] = []

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum':
        return 'bg-gradient-to-r from-purple-400 to-purple-600'
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'Silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-600'
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600'
    }
  }

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
          <Button
            className='cursor-pointer'
            onClick={() => {
              // TODO: Implement badge upload functionality
              console.log('Upload badge functionality coming soon')
            }}
          >
            <Medal className='h-4 w-4 mr-2' />
            Add Badge
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {badges.map((badge) => (
            <Card key={badge._id} className='hover:shadow-lg transition-shadow overflow-hidden'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div
                    className={`h-12 w-12 rounded-full ${getLevelColor(
                      badge.level,
                    )} flex items-center justify-center`}
                  >
                    <Medal className='h-6 w-6 text-white' />
                  </div>
                  <Badge variant='outline' className='capitalize'>
                    {badge.level}
                  </Badge>
                </div>
                <CardTitle className='text-lg'>{badge.name}</CardTitle>
                <p className='text-sm text-gray-600 dark:text-gray-400'>{badge.description}</p>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4 text-gray-500' />
                    <span>Category: {badge.category}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4 text-gray-500' />
                    <span>Earned: {new Date(badge.earnedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {badges.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <Medal className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                No badges yet
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Earn badges by completing achievements and milestones.
              </p>
              <Button
                className='cursor-pointer'
                onClick={() => {
                  // TODO: Implement badge upload functionality
                  console.log('Upload badge functionality coming soon')
                }}
              >
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
