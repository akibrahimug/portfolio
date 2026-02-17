'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { SlideUp, FadeIn } from '@/lib/lightweight-animation'
import { httpClient } from '@/lib/http-client'

const BioComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [hasPublicResume, setHasPublicResume] = useState<boolean>(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  // Fetch public resume on component mount
  useEffect(() => {
    const fetchPublicResume = async () => {
      try {
        // Clear any previous state
        setHasPublicResume(false)
        setResumeUrl(null)

        const response = await httpClient.getPublicResume()

        if (response.success && response.data?.resume?.signedUrl) {
          setResumeUrl(response.data.resume.signedUrl)
          setHasPublicResume(true)
        } else {
          // Try to get the latest resume instead
          const latestResponse = await httpClient.getLatestResume()

          if (latestResponse.success && latestResponse.data?.resume) {
            const resume = latestResponse.data.resume

            // Only show if it's public
            if (resume.isPublic && resume.signedUrl) {
              setResumeUrl(resume.signedUrl)
              setHasPublicResume(true)
            } else {
              setHasPublicResume(false)
            }
          } else {
            setHasPublicResume(false)
          }
        }
      } catch (error) {
        setHasPublicResume(false)
      }
    }

    fetchPublicResume()
  }, [])

  // Memoize resume download callback
  const handleDownloadResume = useCallback(async () => {
    if (!resumeUrl) return

    try {
      setIsDownloading(true)

      // Fetch the PDF as a blob
      const response = await fetch(resumeUrl)
      const blob = await response.blob()

      // Create an object URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a link and set properties
      const link = document.createElement('a')
      link.href = url
      link.download = 'KASOMA_IBRAHIM_CV_2025.pdf'

      // Append to the document, click, and clean up
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Release the object URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [resumeUrl])

  useEffect(() => {
    // Simulate data fetching with a delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 seconds delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='group relative overflow-hidden m-auto md:rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white py-6 md:max-w-[500px] 2xl:w-[500px] lg:w-[450px] lg:ml-8 xl:m-auto md:transform md:transition-all md:duration-500 md:hover:scale-[1.02] md:hover:rotate-1 md:hover:shadow-2xl md:hover:shadow-brand-500/20 md:hover:border-brand-300/30 md:will-change-transform'>
      <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none'></div>
      <div className='px-6 md:px-10'>
        <div className='flex items-center mb-6'>
          <div className='w-1.5 h-8 bg-brand-500 mr-3 rounded-full'></div>
          <h4 className='text-2xl font-semibold text-white'>
            {isLoading ? <Skeleton width={128} height={32} /> : 'About me'}
          </h4>
        </div>

        <div className='mb-8 text-white/90 leading-relaxed'>
          {isLoading ? (
            <>
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton count={1} height={16} className='mb-2' />
              <Skeleton width={200} height={16} />
            </>
          ) : (
            <div
              className='text-base text-white/95 font-light tracking-wide'
              style={{ wordSpacing: '0.1em' }}
            >
              Senior Frontend Engineer building performance-critical React and Next.js applications
              used in production across multiple international markets.
              <br />
              <br />
              I focus on frontend architecture, platform ownership, and delivery at scale — from Nx
              monorepos and shared CI/CD pipelines to CMS-driven systems where reliability,
              performance, and developer experience matter.
              <br />
              <br />I value clean, maintainable code, pragmatic testing (
              <span className='font-normal text-white'>Jest & React Testing Library</span>), and
              close collaboration with product and backend teams.
            </div>
          )}
        </div>

        {!isLoading && hasPublicResume && (
          <div className='flex justify-end'>
            <button
              onClick={handleDownloadResume}
              disabled={isDownloading}
              className='inline-flex items-center text-sm text-white/70 hover:text-white cursor-pointer transition-colors bg-transparent border-none disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span>{isDownloading ? 'Downloading...' : 'Download Resume'}</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 ml-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className='absolute inset-0 md:rounded-2xl md:transition-all md:duration-500 pointer-events-none' />
    </div>
  )
}

const Bio = React.memo(BioComponent)
export default Bio
