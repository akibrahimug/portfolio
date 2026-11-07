import { describe, it, expect } from 'vitest'
import { SITE_URL, ogImage, buildStructuredData, structuredDataJson } from '@/lib/seo'
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

  it('ItemList covers every work and showcase project', () => {
    const list = byType('ItemList')!
    const expected = redesignContent.work.items.length + redesignContent.showcase.items.length
    expect(list.itemListElement).toHaveLength(expected)
    for (const el of list.itemListElement) {
      expect(el.item.url).toMatch(/^https:\/\//)
      expect(el.item.name).toBeTruthy()
    }
  })

  it('serializes to valid JSON with < escaped for safe <script> embedding', () => {
    const json = structuredDataJson()
    expect(() => JSON.parse(json)).not.toThrow()
    expect(json).not.toContain('<')
  })
})
