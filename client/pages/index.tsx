import React from 'react'
import Head from 'next/head'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import dynamic from 'next/dynamic'

// Lazy load non-critical components
const TechStackScroll = dynamic(() => import('@/components/TechStack-scroll'), {
  loading: () => <div className='w-full h-96 bg-gray-100 animate-pulse rounded-lg' />,
  ssr: false,
})

const Projects = dynamic(() => import('@/components/Projects'), {
  loading: () => <div className='w-full h-screen bg-gray-100 animate-pulse rounded-lg' />,
  ssr: false,
})

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Kasoma Ibrahim</title>
        <meta
          name='description'
          content='This is a portfolio showcasing what Kasoma Ibrahim can build and deliver as a Software Engineer'
        />
        <link rel='icon' href='/favicon.png' />

        {/* Preload critical resources */}
        <link rel='preload' href='/icons/avarta.webp' as='image' type='image/webp' />
        <link
          rel='preload'
          href='/fonts/inter-var.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />

        {/* DNS prefetch for external domains */}
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link rel='dns-prefetch' href='//storage.googleapis.com' />

        {/* Resource hints for better performance */}
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover' />
        <meta httpEquiv='x-ua-compatible' content='ie=edge' />
      </Head>
      <Header />
      <div className='max-w-[1400px] m-auto'>
        <HeroSection certified={[]} />
      </div>
      <div className='max-w-[1400px] m-auto' id='tech-stack'>
        <TechStackScroll />
      </div>
      <div>
        <Projects />
      </div>
    </>
  )
}

export default Home
