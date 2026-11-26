import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// In-memory stand-in for the Upstash pipeline calls the store makes.
const { hashes, limit, pipeline } = vi.hoisted(() => {
  const hashes = new Map<string, Map<string, number>>()
  return { hashes, limit: vi.fn(), pipeline: () => makePipeline(hashes) }
})
function makePipeline(hashes: Map<string, Map<string, number>>) {
  const ops: Array<() => unknown> = []
  const p = {
    hincrby: (k: string, f: string, n: number) => {
      ops.push(() => {
        const h = hashes.get(k) ?? new Map()
        h.set(f, (h.get(f) ?? 0) + n)
        hashes.set(k, h)
      })
      return p
    },
    expire: () => (ops.push(() => 1), p),
    hgetall: (k: string) => (ops.push(() => (hashes.has(k) ? Object.fromEntries(hashes.get(k)!) : null)), p),
    exec: async () => ops.map((op) => op()),
  }
  return p
}
vi.mock('@/lib/redis', () => ({ redis: { pipeline } }))
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    class {
      limit = limit
    },
    { slidingWindow: () => ({}) },
  ),
}))

import { GET, POST } from '@/app/api/track/route'
import { parseEvent } from '@/lib/analytics/store'
import { trackKey } from '@/extension/track-key.js'

const beacon = (body: unknown, ua = 'Mozilla/5.0 Chrome/140') =>
  POST(new Request('http://localhost/api/track', { method: 'POST', headers: { 'user-agent': ua }, body: JSON.stringify(body) }))

const read = (query: string, key = 'secret') =>
  GET(new Request(`http://localhost/api/track?${query}`, { headers: { Authorization: `Bearer ${key}` } }))

describe('trackKey (shared by the site and the extension)', () => {
  const origin = 'https://www.kasomaibrahim.dev'
  const el = (html: string) => {
    document.body.innerHTML = html
    return document.body.firstElementChild!
  }

  it('prefers an explicit data-track name', () => {
    expect(trackKey(el('<a href="/x" data-track="hero-cv">CV</a>'), origin)).toBe('hero-cv')
  })
  it('keys same-site links by path and hash, other sites by host and path', () => {
    expect(trackKey(el('<a href="/#work">Work</a>'), origin)).toBe('link:/#work')
    expect(trackKey(el(`<a href="${origin}/work/ef-epi">x</a>`), origin)).toBe('link:/work/ef-epi')
    expect(trackKey(el('<a href="https://github.com/kasoma/">GH</a>'), origin)).toBe('link:github.com/kasoma')
  })
  it('never records a mailto or tel address', () => {
    expect(trackKey(el('<a href="mailto:someone@example.com">Mail</a>'), origin)).toBe('link:mailto')
  })
  it('adds the region around the element, so the same link in two places counts apart', () => {
    document.body.innerHTML = `
      <nav><a href="/#work">Work</a></nav>
      <div id="top"><div><a href="/#work">See work</a></div></div>
      <footer><a href="/#work">Work</a></footer>
      <div id="_r_1_"><button>Go</button></div>`
    const keys = [...document.querySelectorAll('a, button')].map((e) => trackKey(e, origin))
    expect(keys).toEqual(['link:/#work @nav', 'link:/#work @#top', 'link:/#work @footer', 'button:Go'])
  })

  it('keys buttons by aria-label, then by squashed visible text', () => {
    expect(trackKey(el('<button aria-label="Close answer">x</button>'), origin)).toBe('button:Close answer')
    expect(trackKey(el('<button>  Send\n  message </button>'), origin)).toBe('button:Send message')
  })
})

describe('parseEvent', () => {
  it('accepts a view and a click', () => {
    expect(parseEvent({ type: 'view', path: '/' })).toEqual({ type: 'view', path: '/' })
    expect(parseEvent({ type: 'click', path: '/work/ef-pg', key: 'link:/#contact' })).toMatchObject({ key: 'link:/#contact' })
  })
  it('rejects junk paths, keys and types', () => {
    expect(parseEvent({ type: 'view', path: 'https://evil.example' })).toBeNull()
    expect(parseEvent({ type: 'click', path: '/', key: '' })).toBeNull()
    expect(parseEvent({ type: 'click', path: '/', key: 'x'.repeat(121) })).toBeNull()
    expect(parseEvent({ type: 'click', path: '/', key: 'a\nb' })).toBeNull()
    expect(parseEvent({ type: 'purchase', path: '/' })).toBeNull()
    expect(parseEvent(null)).toBeNull()
  })
})

describe('/api/track', () => {
  beforeEach(() => {
    hashes.clear()
    limit.mockReset().mockResolvedValue({ success: true })
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('ANALYTICS_READ_KEY', 'secret')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('records views and clicks, and reads them back per page', async () => {
    await beacon({ type: 'view', path: '/' })
    await beacon({ type: 'view', path: '/' })
    await beacon({ type: 'view', path: '/work/ef-epi' })
    await beacon({ type: 'click', path: '/', key: 'link:/#work' })
    await beacon({ type: 'click', path: '/', key: 'link:/#work' })
    await beacon({ type: 'click', path: '/work/ef-epi', key: 'link:/#work' })

    const res = await read('path=/&days=7')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      path: '/',
      days: 7,
      views: 2,
      clicks: { 'link:/#work': 2 },
      pages: { '/': 2, '/work/ef-epi': 1 },
    })
  })

  it('always answers a beacon with 204, and drops bots, junk and rate-limited senders', async () => {
    expect((await beacon({ type: 'view', path: '/' }, 'Googlebot/2.1')).status).toBe(204)
    expect((await beacon({ type: 'nope' })).status).toBe(204)
    limit.mockResolvedValueOnce({ success: false })
    expect((await beacon({ type: 'view', path: '/' })).status).toBe(204)
    expect(hashes.size).toBe(0)
  })

  it('records nothing outside production (previews and dev share the Redis)', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    await beacon({ type: 'view', path: '/' })
    expect(hashes.size).toBe(0)
  })

  it('refuses a read without the right key, or when no key is configured', async () => {
    expect((await read('path=/', 'wrong')).status).toBe(401)
    vi.stubEnv('ANALYTICS_READ_KEY', '')
    expect((await read('path=/', '')).status).toBe(401)
  })
})
