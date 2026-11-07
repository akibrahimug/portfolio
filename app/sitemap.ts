import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { redesignContent } from '@/lib/redesign-content'
import { caseStudies } from '@/lib/case-studies'

/** Generated from content, so it can't drift from the pages (served at /sitemap.xml). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'monthly',
      priority: 1,
      images: [`${SITE_URL}/og.png`, `${SITE_URL}${redesignContent.hero.avatarSrc}`],
    },
    ...caseStudies.map((c) => ({
      url: `${SITE_URL}/work/${c.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
      images: [`${SITE_URL}${c.image}`],
    })),
  ]
}
