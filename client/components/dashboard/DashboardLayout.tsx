'use client'

import React, { useState, useCallback, useMemo } from 'react'
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
  ArrowLeft,
  User,
} from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'

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
    id: 'avatars',
    label: 'Avatars',
    icon: User,
    href: '/dashboard/avatars',
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

const DashboardLayoutComponent: React.FC<DashboardLayoutProps> = ({
  children,
  currentSection = 'overview',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  // Memoize callbacks to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Memoize current section data
  const currentSectionData = useMemo(
    () => navItems.find((item) => item.id === currentSection),
    [currentSection],
  )

  return (
    <div className='min-h-screen bg-background flex overflow-x-hidden'>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex h-16 items-center justify-between px-6 border-b border-border'>
            <div className='flex items-center space-x-2'>
              <Link href='/' className='lg:hidden'>
                <Button variant='ghost' size='sm' className='p-1'>
                  <ArrowLeft className='h-5 w-5' />
                </Button>
              </Link>
              <div className='h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>P</span>
              </div>
              <span className='text-xl font-bold text-foreground'>Portfolio</span>
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
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
          <div className='border-t border-border p-4'>
            <div className='flex items-center justify-between'>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleTheme}
                className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              >
                {theme === 'dark' ? <Clock className='h-5 w-5' /> : <Clock className='h-5 w-5' />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 lg:pl-0 min-w-0 overflow-x-hidden'>
        {/* Top bar */}
        <div className='sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border'>
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='sm' onClick={toggleSidebar} className='lg:hidden'>
                <DotsThree className='h-5 w-5' />
              </Button>
              <Link href='/'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='hidden lg:flex items-center space-x-2 text-muted-foreground hover:text-foreground'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Back to Portfolio</span>
                </Button>
              </Link>
              <div>
                <h1 className='text-xl font-semibold text-foreground'>
                  {currentSectionData?.label || 'Dashboard'}
                </h1>
                <p className='text-sm text-muted-foreground'>Manage your portfolio data</p>
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
          <div className='mx-auto max-w-7xl w-full min-w-0 overflow-x-hidden'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export const DashboardLayout = React.memo(DashboardLayoutComponent)

// Stats cards component for overview
const StatsCardComponent: React.FC<{
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
    <Card className='bg-card border-border'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-primary' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-foreground'>{value}</div>
        {description && <p className='text-xs text-muted-foreground mt-1'>{description}</p>}
        {trend && (
          <div className='flex items-center mt-2'>
            <Badge variant={trend.isPositive ? 'default' : 'destructive'} className='text-xs'>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </Badge>
            <span className='text-xs text-muted-foreground ml-2'>from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const StatsCard = React.memo(StatsCardComponent)

// Breadcrumb component
const BreadcrumbComponent: React.FC<{
  items: { label: string; href?: string }[]
}> = ({ items }) => {
  return (
    <nav className='flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto no-scrollbar'>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className='text-muted-foreground'>/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className='hover:text-primary transition-colors whitespace-nowrap'
            >
              {item.label}
            </Link>
          ) : (
            <span className='text-foreground whitespace-nowrap'>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export const Breadcrumb = React.memo(BreadcrumbComponent)
