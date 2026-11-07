/**
 * SEO / GEO / AEO helpers — canonical URL + JSON-LD structured data.
 *
 * Everything is derived from `redesign-content.ts` so the structured data
 * stays in sync with the visible page. Consumed by `app/page.tsx` + `app/work/[slug]/page.tsx` (JSON-LD), `app/layout.tsx` (metadata), `app/llms.txt/route.ts`.
 *
 * The canonical origin is the www host — Vercel 308s the apex to it.
 */

import { redesignContent } from './redesign-content'
import { getCaseStudy, type CaseStudy } from './case-studies'

export const SITE_URL = 'https://www.kasomaibrahim.dev'

export const ogImage = {
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: 'Ibrahim Kasoma · Senior Frontend Engineer. TypeScript, React, Node.js.',
}

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

/** Flattened, de-duplicated skill list for Person.knowsAbout. */
function knowsAbout(): string[] {
  const all = redesignContent.skills.groups.flatMap((g) => [...g.items])
  return [...new Set(all)]
}

function person() {
  const { hero, about, contact, experience } = redesignContent
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Ibrahim Kasoma',
    jobTitle: 'Senior Frontend Engineer',
    description: redesignContent.meta.description,
    url: `${SITE_URL}/`,
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${hero.avatarSrc}`,
      caption: hero.avatarAlt,
    },
    email: `mailto:${contact.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Stroud',
      addressRegion: 'Gloucestershire',
      addressCountry: 'GB',
    },
    worksFor: {
      '@type': 'Organization',
      name: experience.roles[0].company,
      url: 'https://www.ef.com',
    },
    alumniOf: experience.education.map((e) => ({
      '@type': 'EducationalOrganization',
      name: e.school,
    })),
    knowsAbout: knowsAbout(),
    sameAs: contact.socials.map((s) => s.href),
  }
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: 'Ibrahim Kasoma · Portfolio',
    description: redesignContent.meta.description,
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en',
  }
}

function profilePage() {
  return {
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/#webpage`,
    url: `${SITE_URL}/`,
    name: redesignContent.meta.title,
    description: redesignContent.meta.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    mainEntity: { '@id': PERSON_ID },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImage.url,
      width: ogImage.width,
      height: ogImage.height,
    },
    inLanguage: 'en',
  }
}

/**
 * Every project as one list. Projects with a case study point at that page (the canonical
 * home for the work) with the live site as `sameAs`; the rest point at their live site.
 */
function projectList() {
  const all = [
    ...redesignContent.work.items.map((p) => ({ ...p, ef: true })),
    ...redesignContent.showcase.items.map((p) => ({ ...p, ef: false })),
  ]
  const items = all.map((p) => {
    const cs = getCaseStudy(p.slug)
    return {
      '@type': 'CreativeWork' as const,
      name: cs?.title ?? p.title,
      description: cs?.lede ?? p.summary,
      url: cs ? `${SITE_URL}/work/${cs.slug}` : p.live,
      ...(cs && p.live ? { sameAs: p.live } : {}),
      ...(p.ef ? { contributor: { '@id': PERSON_ID } } : { creator: { '@id': PERSON_ID } }),
    }
  })
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#projects`,
    name: 'Projects by Ibrahim Kasoma',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item,
    })),
  }
}

export function buildStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [person(), website(), profilePage(), projectList()],
  }
}

/** JSON-LD for a case-study page: the work itself, and where it sits in the site. */
export function buildCaseStudyData(c: CaseStudy) {
  const url = `${SITE_URL}/work/${c.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        name: c.title,
        headline: `${c.title}: case study`,
        description: c.lede,
        abstract: c.outcome,
        url,
        image: `${SITE_URL}${c.image}`,
        ...(c.live ? { sameAs: c.live } : {}),
        keywords: c.stack.join(', '),
        [c.origin === 'ef' ? 'contributor' : 'creator']: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ibrahim Kasoma', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Case studies', item: `${SITE_URL}/#work` },
          { '@type': 'ListItem', position: 3, name: c.title, item: url },
        ],
      },
    ],
  }
}

const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

/** JSON-LD payload, escaped so it is safe inside a <script> tag. */
export function structuredDataJson(): string {
  return safeJson(buildStructuredData())
}
export const caseStudyJson = (c: CaseStudy) => safeJson(buildCaseStudyData(c))
