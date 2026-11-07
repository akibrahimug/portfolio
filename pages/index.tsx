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
import { SITE_URL, ogImage, structuredDataJson } from '@/lib/seo'

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
        <link rel='canonical' href={`${SITE_URL}/`} />
        <meta
          name='robots'
          content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Ibrahim Kasoma' />
        <meta property='og:locale' content='en_GB' />
        <meta property='og:url' content={`${SITE_URL}/`} />
        <meta property='og:title' content={redesignContent.meta.title} />
        <meta property='og:description' content={redesignContent.meta.description} />
        <meta property='og:image' content={ogImage.url} />
        <meta property='og:image:width' content={String(ogImage.width)} />
        <meta property='og:image:height' content={String(ogImage.height)} />
        <meta property='og:image:alt' content={ogImage.alt} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={redesignContent.meta.title} />
        <meta name='twitter:description' content={redesignContent.meta.description} />
        <meta name='twitter:image' content={ogImage.url} />
        <meta name='twitter:creator' content='@Akibrahimug' />
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: structuredDataJson() }}
        />
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
