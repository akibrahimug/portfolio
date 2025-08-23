'use client'

import React, { useState } from 'react'
import { Download, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
/**
 * Renders an interactive CV/resume page with contact information, skills, education, and professional experience, including a button to download a PDF version of the CV.
 *
 * @returns The complete CV page as a React component.
 *
 * @remark The download button fetches a hosted PDF and triggers a client-side download. If the download fails, an error notification is displayed.
 */
export function CvComponent() {
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      // adjust this URL to wherever your PDF is hosted
      const pdfUrl =
        'https://storage.googleapis.com/my-rest-api-2022-kasoma/cv/KASOMA%20IBRAHIM%20_CV%202025.pdf'

      // Fetch the PDF as a blob
      const response = await fetch(pdfUrl)
      const blob = await response.blob()

      // Create an object URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a link and set properties
      const link = document.createElement('a')
      link.href = url
      link.download = 'KASOMA_IBRAHIM_CV_2025.pdf' // Set the filename

      // Append to the document, click, and clean up
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Release the object URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download CV. Please try again later.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100'>
      {/* Hero section */}
      <header className='bg-white dark:bg-gray-800 shadow-md'>
        <div className='container mx-auto px-6 py-8 flex justify-between items-center'>
          <div
            onClick={() => router.back()}
            className='border rounded-3xl p-2 bg-black dark:bg-white cursor-pointer'
          >
            <ArrowLeft size={20} className='text-white dark:text-black' />
          </div>
          <h1 className='md:text-3xl text-lg text-center font-bold'>Kasoma Ibrahim</h1>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className='flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 cursor-pointer'
          >
            <Download size={16} />
            {isDownloading ? 'Downloading...' : 'Download CV'}
          </Button>
        </div>
      </header>

      {/* Page layout */}
      <main className='container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Sidebar */}
        <aside className='space-y-6'>
          <section>
            <h2 className='text-xl font-semibold mb-2'>Contact</h2>
            <p>07310843342</p>
            <p>
              <Link
                href='mailto:kasomaibrahim@gmail.com'
                className='text-blue-400 underline hover:underline'
              >
                kasomaibrahim@gmail.com
              </Link>
            </p>
            <p>
              <Link href='https://linkedin.com' className='text-blue-400 underline hover:underline'>
                LinkedIn
              </Link>
            </p>
            <p>
              <Link href='https://github.com' className='text-blue-400 underline hover:underline'>
                GitHub
              </Link>
            </p>
            <p>
              <Link
                href='https://kasomaibrahim.dev'
                className='text-blue-400 underline hover:underline'
              >
                Portfolio
              </Link>
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>Skills</h2>
            <ul className='list-disc list-inside space-y-1'>
              {[
                'JavaScript',
                'TypeScript',
                'Node.js',
                'Next.js',
                'React.js',
                'Redux',
                'Nx Monorepos',
                'CI/CD',
                'Semantic Release',
                'Agile & Scrum',
                'SQL',
                'AWS / GCP',
                'REST APIs',
                'Git & GitHub',
                'Storyblok',
                'Chart.js',
                'Jest',
                'React Testing Library',
                'Tailwind CSS',
                'HTML',
              ].map((skill) => (
                <li key={skill} className='text-sm'>
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>Education</h2>
            <div className='space-y-4 text-sm'>
              <div>
                <p className='font-medium'>TreeHouse TechDegree</p>
                <p>Front End: May 2021 – Dec 2021</p>
              </div>
              <div>
                <p className='font-medium'>TreeHouse TechDegree</p>
                <p>FullStack JS: Dec 2021 – Jul 2022</p>
              </div>
            </div>
          </section>
        </aside>

        {/* Main content */}
        <section className='md:col-span-2 space-y-8'>
          <section>
            <h2 className='text-2xl font-bold mb-4'>Experience</h2>

            {[
              {
                company: 'EF Education First',
                role: 'Frontend Developer',
                location: 'London',
                period: 'Mar 2023 – Present',
                bullets: [
                  'Managed & optimized 28+ microfrontends (React, Next.js, Gatsby) — reduced average bundle size by 45% and accelerated release cycles by 30%.',
                  'Built & maintained an Nx monorepo housing ~20 shared projects, streamlining dependency updates, package releases, and cross-team collaboration — cut CI build times by 35%.',
                  'Revamped EF English Proficiency Index (EPI) data visualizations with Chart.js for 2.1 million test results across 116 countries (113 ranked, top score 647 in the Netherlands), aligning design/backend API structures and accelerating stakeholder insights by 40%',
                ],
              },
              {
                company: 'EF Education First',
                role: 'Junior Frontend Developer',
                location: 'London',
                period: 'Mar 2022 – Feb 2023',
                bullets: [
                  'Led WP→Next.js + Storyblok migration of three flagship EF blogs (We are EF, EF Academy, Teach Online), replacing a monolithic PHP setup with a React-based stack that now supports 40+ language locales, powering 3.5 million monthly visits (global rank #15,967) at 4.26 pages per visit and a 00:02:50 avg session duration',
                  'Slashed First Contentful Paint by 60% (from ~4.2 s down to ~1.7 s) via Next.js image optimization, code-splitting, and on-demand Storyblok delivery—driving improvements in Core Web Vitals and helping push the bounce rate down to 50.31%',
                  'Orchestrated 100+ cross-regional releases/month using GitHub Actions → AWS S3 static deployments, achieving zero-downtime launches and sub-2 s average load times.',
                  'Collaborated with designers, backend engineers, SEO specialists, content teams and analytics leads across 55 countries, embedding A/B testing and data-driven insights into every rollout.',
                  'Integrated Storyblok headlessly into React, Gatsby and Next.js projects, cutting editorial build-pipeline overhead by 50% and empowering content creators to publish updates in minutes.',
                ],
              },
              {
                company: 'SD CARE Agency',
                role: 'Junior FullStack Developer',
                location: 'Surrey',
                period: 'Jun 2022 – Feb 2023',
                bullets: [
                  'Built internal tools with Express & React.',
                  'Optimized workflows—40% faster.',
                  'Enhanced responsive UIs.',
                ],
              },
            ].map((job) => (
              <div
                key={job.role}
                className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6'
              >
                <div className='flex justify-between mb-3'>
                  <div>
                    <h3 className='font-semibold'>{job.company}</h3>
                    <p className='text-sm'>
                      {job.role}, {job.location}
                    </p>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{job.period}</p>
                </div>
                <ul className='list-disc list-inside space-y-1 text-sm'>
                  {job.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </section>
      </main>
    </div>
  )
}
