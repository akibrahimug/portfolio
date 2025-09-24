import React from 'react'
import { DashboardLayout, StatsCard, Breadcrumb } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Plus,
  TrendUp,
  FolderOpen,
  Clock,
  Briefcase,
  GraduationCap,
  Certificate,
  Medal,
} from '@phosphor-icons/react'
import Link from 'next/link'
import {
  useProjects,
  useMessages,
  useTechnologies,
  useExperiences,
  useCertifications,
  useBadges,
} from '@/hooks/useHttpApi'
import type { Message } from '@/types/api'

const DashboardOverview: React.FC = () => {
  // Use real API data
  const { data: projectsData } = useProjects()
  const { data: messagesData } = useMessages()
  const { data: technologiesData } = useTechnologies()
  const { data: experiencesData } = useExperiences()
  const { data: certificationsData } = useCertifications()
  const { data: badgesData } = useBadges()

  const projects = projectsData?.items || []
  const messages = messagesData || []
  const technologies = technologiesData || []
  const experiences = experiencesData || []
  const certifications = certificationsData?.items || []
  const badges = badgesData?.data?.badges || []

  // Calculate real stats (memoized to prevent recalculation)
  const stats = React.useMemo(
    () => ({
      projects: {
        total: projects.length,
        published: projects.filter((p) => p.status === 'published').length,
        draft: projects.filter((p) => p.status === 'draft').length,
      },
      experiences: {
        total: experiences.length,
        current: experiences.filter((e) => e.current).length,
      },
      technologies: {
        total: technologies.length,
        categories: [...new Set(technologies.map((t) => t.category))].length,
      },
      messages: {
        total: messages.length,
        unread: messages.length, // All messages are "unread" for now
      },
      certifications: {
        total: certifications.length,
      },
      badges: {
        total: badgesData?.data?.total || 0,
      },
    }),
    [projects, experiences, technologies, messages, certifications, badges, badgesData],
  )

  // Generate recent activity from real data (memoized to prevent recalculation)
  const recentActivity = React.useMemo(() => {
    const activities = []

    // Add up to 2 projects
    const recentProjects = projects.slice(0, 2).map((project, index) => ({
      id: `project-${index}`,
      type: 'project',
      title: project.title || 'Untitled Project',
      action: project.status === 'published' ? 'published' : 'updated',
      timestamp: new Date(
        project.updatedAt || project.createdAt || Date.now(),
      ).toLocaleDateString(),
      icon: FolderOpen,
    }))
    activities.push(...recentProjects)

    // Add up to 2 messages
    const recentMessages = messages.slice(0, 2).map((message: Message, index: number) => ({
      id: `message-${index}`,
      type: 'message',
      title: `Message from ${message.name}`,
      action: 'received',
      timestamp: new Date(message.createdAt || Date.now()).toLocaleDateString(),
      icon: Clock,
    }))
    activities.push(...recentMessages)

    // Add 1 experience
    const recentExperience = experiences.slice(0, 1).map((experience, index) => ({
      id: `experience-${index}`,
      type: 'experience',
      title: `${experience.title} at ${experience.company}`,
      action: experience.current ? 'ongoing' : 'completed',
      timestamp: new Date(experience.startDate || Date.now()).toLocaleDateString(),
      icon: Briefcase,
    }))
    activities.push(...recentExperience)

    return activities.slice(0, 5) // Limit to 5 most recent items
  }, [projects, messages, experiences])

  const quickActions = [
    {
      title: 'Add New Project',
      description: 'Create a new portfolio project',
      href: '/dashboard/projects',
      icon: FolderOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Update Experience',
      description: 'Add or modify work experience',
      href: '/dashboard/experiences',
      icon: Briefcase,
      color: 'bg-green-500',
    },
    {
      title: 'Add Certification',
      description: 'Include a new certification',
      href: '/dashboard/certifications',
      icon: Certificate,
      color: 'bg-purple-500',
    },
    {
      title: 'Upload Resume',
      description: 'Add a new resume version',
      href: '/dashboard/resumes',
      icon: FolderOpen,
      color: 'bg-orange-500',
    },
  ]

  return (
    <DashboardLayout currentSection='overview'>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
        <StatsCard
          title='Total Projects'
          value={stats.projects.total}
          description={`${stats.projects.published} published, ${stats.projects.draft} drafts`}
          icon={FolderOpen}
        />
        <StatsCard
          title='Experience'
          value={stats.experiences.total}
          description={`${stats.experiences.current} current position${
            stats.experiences.current === 1 ? '' : 's'
          }`}
          icon={Briefcase}
        />
        <StatsCard
          title='Technologies'
          value={stats.technologies.total}
          description={`${stats.technologies.categories} categories`}
          icon={Plus}
        />
        <StatsCard
          title='Messages'
          value={stats.messages.total}
          description={`${stats.messages.unread} unread`}
          icon={Clock}
        />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
        {/* Quick Actions */}
        <Card className='xl:col-span-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendUp className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant='outline'
                  className='w-full justify-start h-auto p-3 sm:p-4 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer'
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${action.color} flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    <action.icon className='h-4 w-4 sm:h-5 sm:w-5 text-white' />
                  </div>
                  <div className='text-left flex-1 min-w-0'>
                    <div className='font-medium text-sm sm:text-base truncate'>{action.title}</div>
                    <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate'>
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <>
                <div className='space-y-4'>
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className='flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors'
                    >
                      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0'>
                        <activity.icon className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='font-medium text-sm sm:text-base truncate'>
                            {activity.title}
                          </span>
                          <Badge variant='secondary' className='text-xs'>
                            {activity.action}
                          </Badge>
                        </div>
                        <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate'>
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 pt-4 border-t border-gray-200 dark:border-slate-700'>
                  <Link href='/dashboard/projects'>
                    <Button variant='outline' className='w-full cursor-pointer'>
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className='text-center py-8'>
                <Clock className='h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-3' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>No recent activity</p>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                  Start by creating projects or adding content
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-gray-900 dark:text-white'>
              {stats.experiences.total}
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {stats.experiences.current} current position
              {stats.experiences.current === 1 ? '' : 's'}
            </p>
            <div className='mt-4'>
              <Link href='/dashboard/experiences'>
                <Button variant='outline' size='sm' className='cursor-pointer'>
                  Manage Experience
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <GraduationCap className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-gray-900 dark:text-white'>
              {stats.certifications.total}
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {stats.certifications.total === 0
                ? 'No certifications yet'
                : `${stats.certifications.total} certification${
                    stats.certifications.total === 1 ? '' : 's'
                  }`}
            </p>
            <div className='mt-4'>
              <Link href='/dashboard/certifications'>
                <Button variant='outline' size='sm' className='cursor-pointer'>
                  Manage Certifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Medal className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-gray-900 dark:text-white'>
              {stats.badges.total}
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {stats.badges.total === 0
                ? 'No badges earned yet'
                : `${stats.badges.total} badge${stats.badges.total === 1 ? '' : 's'} earned`}
            </p>
            <div className='mt-4'>
              <Link href='/dashboard/badges'>
                <Button variant='outline' size='sm' className='cursor-pointer'>
                  Manage Badges
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DashboardOverview
