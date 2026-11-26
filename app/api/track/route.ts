import { createHash, timingSafeEqual } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { parseEvent, record, report } from '@/lib/analytics/store'

/**
 * POST — the site's beacon (a page view or a click). Always answers 204: the page never waits
 *        on or reacts to analytics, and a bot learns nothing from the reply.
 * GET  — the click-inspector extension's read: `?path=/&days=30` with
 *        `Authorization: Bearer $ANALYTICS_READ_KEY`.
 */

const limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, '10 m'),
      prefix: 'track',
      ephemeralCache: new Map(),
    })
  : null

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly/i

/** Only production counts: preview deploys and local dev share the same Redis. */
const recording = () => process.env.VERCEL_ENV === 'production' || process.env.ANALYTICS_RECORD === '1'

const noContent = () => new Response(null, { status: 204 })

export async function POST(req: Request) {
  if (!redis || !recording()) return noContent()
  if (BOT_RE.test(req.headers.get('user-agent') ?? '')) return noContent()

  const event = parseEvent(await req.json().catch(() => null))
  if (!event) return noContent()

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  try {
    if (limiter && !(await limiter.limit(ip)).success) return noContent()
    await record(redis, event)
  } catch (e) {
    console.error(`[track] not recorded: ${e instanceof Error ? e.message : String(e)}`)
  }
  return noContent()
}

const digest = (s: string) => createHash('sha256').update(s).digest()

function authorised(req: Request): boolean {
  const expected = process.env.ANALYTICS_READ_KEY
  if (!expected) return false
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  return timingSafeEqual(digest(given), digest(expected))
}

export async function GET(req: Request) {
  if (!authorised(req)) return Response.json({ error: 'Unauthorised.' }, { status: 401 })
  if (!redis) return Response.json({ error: 'Analytics storage is not configured.' }, { status: 503 })

  const params = new URL(req.url).searchParams
  const path = params.get('path') || '/'
  const days = Math.min(Math.max(Number(params.get('days')) || 30, 1), 365)
  try {
    return Response.json(await report(redis, path, days), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error(`[track] report failed: ${e instanceof Error ? e.message : String(e)}`)
    return Response.json({ error: 'Could not read analytics.' }, { status: 502 })
  }
}
