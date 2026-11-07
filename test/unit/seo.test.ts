import { describe, it, expect } from 'vitest'
import { SITE_URL, ogImage, buildStructuredData, buildCaseStudyData, structuredDataJson } from '@/lib/seo'
import { caseStudies } from '@/lib/case-studies'
import { redesignContent } from '@/lib/redesign-content'

describe('structured data (JSON-LD)', () => {
  const graph = buildStructuredData()['@graph'] as Array<Record<string, any>>
  const byType = (t: string) => graph.find((n) => n['@type'] === t)

  it('emits Person, WebSite, ProfilePage, and ItemList nodes', () => {
    for (const t of ['Person', 'WebSite', 'ProfilePage', 'ItemList']) {
      expect(byType(t), `missing ${t}`).toBeDefined()
    }
  })

  it('Person carries identity, socials, and skills', () => {
    const person = byType('Person')!
    expect(person.name).toBe('Ibrahim Kasoma')
    expect(person.sameAs).toEqual(redesignContent.contact.socials.map((s) => s.href))
    expect(person.knowsAbout).toContain('TypeScript')
    expect(person.image.url).toBe(`${SITE_URL}${redesignContent.hero.avatarSrc}`)
  })

  it('ProfilePage points at the Person and the OG image', () => {
    const page = byType('ProfilePage')!
    expect(page.mainEntity).toEqual({ '@id': `${SITE_URL}/#person` })
    expect(page.primaryImageOfPage.url).toBe(ogImage.url)
  })

  it('ItemList covers every project, pointing case studies at their own pages', () => {
    const list = byType('ItemList')!
    const expected = redesignContent.work.items.length + redesignContent.showcase.items.length
    expect(list.itemListElement).toHaveLength(expected)
    const urls = list.itemListElement.map((e: any) => e.item.url)
    for (const c of caseStudies) expect(urls).toContain(`${SITE_URL}/work/${c.slug}`)
  })

  it('case-study JSON-LD names the work, its page and its breadcrumb', () => {
    const c = caseStudies[0]
    const graph = buildCaseStudyData(c)['@graph'] as Array<Record<string, any>>
    expect(graph[0]).toMatchObject({ '@type': 'CreativeWork', name: c.title, url: `${SITE_URL}/work/${c.slug}` })
    expect(graph[1].itemListElement.at(-1).item).toBe(`${SITE_URL}/work/${c.slug}`)
  })

  it('no structured data points at an anchor that no longer exists', () => {
    const json = JSON.stringify(buildStructuredData())
    for (const gone of ['#showcase', '#skills', '#process', '#impact']) expect(json).not.toContain(gone)
  })

  it('serializes to valid JSON with < escaped for safe <script> embedding', () => {
    const json = structuredDataJson()
    expect(() => JSON.parse(json)).not.toThrow()
    expect(json).not.toContain('<')
  })
})
