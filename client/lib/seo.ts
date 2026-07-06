/**
 * SEO / GEO / AEO helpers — canonical URL + JSON-LD structured data.
 *
 * Everything is derived from `redesign-content.ts` so the structured data
 * stays in sync with the visible page. Consumed by `pages/index.tsx`.
 *
 * The canonical origin is the www host — Vercel 308s the apex to it.
 */

import { redesignContent } from './redesign-content'

export const SITE_URL = 'https://www.kasomaibrahim.dev'

export const ogImage = {
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: 'Ibrahim Kasoma — Senior Software Engineer. TypeScript, React, Node.js.',
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
    alternateName: 'Kasoma Ibrahim',
    jobTitle: 'Senior Software Engineer',
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
      addressRegion: 'England',
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
    name: 'Ibrahim Kasoma — Portfolio',
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

/** Selected work (EF surfaces) + personal showcase as one project list. */
function projectList() {
  const work = redesignContent.work.items.map((p) => ({
    '@type': 'CreativeWork' as const,
    name: p.title,
    description: p.summary,
    url: p.live,
    contributor: { '@id': PERSON_ID },
  }))
  const showcase = redesignContent.showcase.items.map((p) => ({
    '@type': 'CreativeWork' as const,
    name: p.title,
    description: p.summary,
    url: p.live,
    creator: { '@id': PERSON_ID },
  }))
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#projects`,
    name: 'Projects by Ibrahim Kasoma',
    itemListElement: [...work, ...showcase].map((item, i) => ({
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

/** JSON-LD payload, escaped so it is safe inside a <script> tag. */
export function structuredDataJson(): string {
  return JSON.stringify(buildStructuredData()).replace(/</g, '\\u003c')
}
