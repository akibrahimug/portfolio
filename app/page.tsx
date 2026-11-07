import { structuredDataJson } from '@/lib/seo'
import { Band } from '@/components/patterns/Band'
import { Hero } from '@/components/sections/Hero'
import { CaseStudies } from '@/components/sections/CaseStudies'
import { Experience } from '@/components/sections/Experience'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <>
      <script
        type='application/ld+json'
        // Built from static content at build time, never from user input.
        dangerouslySetInnerHTML={{ __html: structuredDataJson() }}
      />
      <main>
        <Hero />
        <Band>
          <CaseStudies />
        </Band>
        <Band>
          <Experience />
        </Band>
        <Band>
          <About />
        </Band>
        <Band>
          <Contact />
        </Band>
      </main>
    </>
  )
}
