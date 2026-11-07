import { structuredDataJson } from '@/lib/seo'
import { Band } from '@/components/patterns/Band'
import { SiteNav } from '@/components/sections/SiteNav'
import { Hero } from '@/components/sections/Hero'
import { Work } from '@/components/sections/Work'
import { Impact } from '@/components/sections/Impact'
import { Showcase } from '@/components/sections/Showcase'
import { Experience } from '@/components/sections/Experience'
import { Stack } from '@/components/sections/Stack'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'

export default function HomePage() {
  return (
    <>
      <script
        type='application/ld+json'
        // Built from static content at build time, never from user input.
        dangerouslySetInnerHTML={{ __html: structuredDataJson() }}
      />
      <SiteNav />
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
    </>
  )
}
