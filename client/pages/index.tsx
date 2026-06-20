import React from 'react'
import Head from 'next/head'

import { DarkSpace } from '@/components/site/DarkSpace'
import { SiteNav } from '@/components/site/SiteNav'
import { Hero } from '@/components/site/Hero'
import { Work } from '@/components/site/Work'
import { Impact } from '@/components/site/Impact'
import { Showcase } from '@/components/site/Showcase'
import { Process } from '@/components/site/Process'
import { Experience } from '@/components/site/Experience'
import { Stack } from '@/components/site/Stack'
import { About } from '@/components/site/About'
import { Contact } from '@/components/site/Contact'
import { Footer } from '@/components/site/Footer'
import { redesignContent } from '@/lib/redesign-content'

/** Full-bleed section band. `invert` flips the palette (black panel / red panel). */
function Band({ invert = false, children }: { invert?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={
        invert ? 'feature-invert bg-background py-20 text-foreground md:py-32' : 'py-14 md:py-20'
      }
    >
      {children}
    </div>
  )
}

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
        <link rel='icon' href='/favicon.png' />
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover' />
      </Head>
      <div className='relative min-h-screen bg-background text-foreground antialiased'>
        <DarkSpace />
        <SiteNav />
        <div className='relative z-10'>
          <main>
          <Hero />
          <Band>
            <Work />
          </Band>
          <Band invert>
            <Impact />
          </Band>
          <Band>
            <Showcase />
          </Band>
          <Band>
            <Process />
          </Band>
          <Band>
            <Experience />
          </Band>
          <Band invert>
            <Stack />
          </Band>
          <Band>
            <About />
          </Band>
          <Band invert>
            <Contact />
          </Band>
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Home
