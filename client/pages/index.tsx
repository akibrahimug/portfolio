import React from 'react'
import Head from 'next/head'

import { TopNav } from '@/components/redesign/TopNav'
import { Hero } from '@/components/redesign/Hero'
import { TickerStrip } from '@/components/redesign/TickerStrip'
import { SelectedWork } from '@/components/redesign/SelectedWork'
import { About } from '@/components/redesign/About'
import { Connect } from '@/components/redesign/Connect'
import { RedesignFooter } from '@/components/redesign/RedesignFooter'
import { ScrollProgress } from '@/components/redesign/ScrollProgress'
import { redesignContent } from '@/lib/redesign-content'

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>{redesignContent.meta.title}</title>
        <meta name='description' content={redesignContent.meta.description} />
        <meta property='og:title' content={redesignContent.meta.title} />
        <meta property='og:description' content={redesignContent.meta.description} />
        <meta property='og:image' content='/icons/avarta.webp' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='theme-color' content='#09090b' />
        <link rel='icon' href='/favicon.png' />
        <link rel='preload' href='/icons/avarta.webp' as='image' type='image/webp' />
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover' />
      </Head>
      <div className='min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-brand-500/30 selection:text-brand-100'>
        <ScrollProgress />
        <TopNav />
        <main>
          <Hero />
          <TickerStrip />
          <SelectedWork />
          <About />
          <Connect />
        </main>
        <RedesignFooter />
      </div>
    </>
  )
}

export default Home
