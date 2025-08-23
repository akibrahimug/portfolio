'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  House,
  Briefcase,
  Certificate,
  Medal,
  FileText,
  Bell,
  DotsThree,
  ChartLine,
  FolderOpen,
  Clock,
} from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'

// Temporary mock components until Clerk is properly installed
const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
const SignedOut: React.FC<{ children: React.ReactNode }> = () => null
const RedirectToSignIn: React.FC = () => null
const UserButton: React.FC<any> = () => (
  <div className='flex items-center space-x-2'>
    <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
      <span className='text-white font-medium text-sm'>U</span>
    </div>
    <div className='hidden md:block'>
      <p className='text-sm font-medium text-gray-900 dark:text-white'>Demo User</p>
      <p className='text-xs text-gray-500 dark:text-gray-400'>Clerk integration pending</p>
    </div>
  </div>
)

interface DashboardLayoutProps {
  children: React.ReactNode
  currentSection?: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: House,
    href: '/dashboard',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    href: '/dashboard/projects',
  },
  {
    id: 'experiences',
    label: 'Experience',
    icon: Briefcase,
    href: '/dashboard/experiences',
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Certificate,
    href: '/dashboard/certifications',
  },
  {
    id: 'badges',
    label: 'Badges',
    icon: Medal,
    href: '/dashboard/badges',
  },
  {
    id: 'technologies',
    label: 'Technologies',
    icon: ChartLine,
    href: '/dashboard/technologies',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: Bell,
    href: '/dashboard/messages',
  },
  {
    id: 'resumes',
    label: 'Resumes',
    icon: FileText,
    href: '/dashboard/resumes',
  },
]

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentSection = 'overview',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex overflow-x-hidden'>
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
              onClick={toggleSidebar}
            />
          )}

          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:shadow-none ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className='flex h-full flex-col'>
              {/* Header */}
              <div className='flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-slate-700'>
                <div className='flex items-center space-x-2'>
                  <div className='h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center'>
                    <span className='text-white font-bold text-sm'>P</span>
                  </div>
                  <span className='text-xl font-bold text-gray-900 dark:text-white'>Portfolio</span>
                </div>
                <Button variant='ghost' size='sm' onClick={toggleSidebar} className='lg:hidden'>
                  <DotsThree className='h-5 w-5' />
                </Button>
              </div>

              {/* Navigation */}
              <nav className='flex-1 space-y-1 px-4 py-6'>
                {navItems.map((item) => {
                  const isActive = currentSection === item.id
                  return (
                    <Link key={item.id} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={`w-full justify-start space-x-3 h-12 ${
                          isActive
                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <item.icon className='h-5 w-5' />
                        <span className='flex-1 text-left'>{item.label}</span>
                        {item.badge && (
                          <Badge variant={isActive ? 'secondary' : 'default'} className='ml-auto'>
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className='border-t border-gray-200 dark:border-slate-700 p-4'>
                <div className='flex items-center justify-between'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className='text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                  >
                    {theme === 'dark' ? (
                      <Clock className='h-5 w-5' />
                    ) : (
                      <Clock className='h-5 w-5' />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className='flex-1 lg:pl-0 min-w-0 overflow-x-hidden'>
            {/* Top bar */}
            <div className='sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700'>
              <div className='flex h-16 items-center justify-between px-6'>
                <div className='flex items-center space-x-4'>
                  <Button variant='ghost' size='sm' onClick={toggleSidebar} className='lg:hidden'>
                    <DotsThree className='h-5 w-5' />
                  </Button>
                  <div>
                    <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                      {navItems.find((item) => item.id === currentSection)?.label || 'Dashboard'}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Manage your portfolio data
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <SignedIn>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: 'h-8 w-8',
                          userButtonPopoverCard: 'shadow-lg',
                          userButtonPopoverActionButton: 'hover:bg-gray-50',
                        },
                      }}
                      showName
                    />
                  </SignedIn>
                </div>
              </div>
            </div>

            {/* Page content */}
            <main className='flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden min-w-0 no-scrollbar'>
              <div className='mx-auto max-w-7xl w-full min-w-0 overflow-x-hidden'>{children}</div>
            </main>
          </div>
        </div>
      </SignedIn>
    </>
  )
}

// Stats cards component for overview
export const StatsCard: React.FC<{
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
}> = ({ title, value, description, icon: Icon, trend }) => {
  return (
    <Card className='bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
          {title}
        </CardTitle>
        <Icon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-gray-900 dark:text-white'>{value}</div>
        {description && (
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{description}</p>
        )}
        {trend && (
          <div className='flex items-center mt-2'>
            <Badge variant={trend.isPositive ? 'default' : 'destructive'} className='text-xs'>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </Badge>
            <span className='text-xs text-gray-500 dark:text-gray-400 ml-2'>from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Breadcrumb component
export const Breadcrumb: React.FC<{
  items: { label: string; href?: string }[]
}> = ({ items }) => {
  return (
    <nav className='flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 overflow-x-auto no-scrollbar'>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className='text-gray-400'>/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap'
            >
              {item.label}
            </Link>
          ) : (
            <span className='text-gray-900 dark:text-white whitespace-nowrap'>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
