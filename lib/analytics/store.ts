import type { Redis } from '@upstash/redis'

/**
 * Cookie-free click analytics in Upstash. Nothing about the visitor is stored: per UTC day,
 * one hash of page views (`path → n`) and one of clicks (`path␉key → n`), kept 400 days.
 */

const TTL_SECONDS = 400 * 24 * 60 * 60
const SEP = '\t'

export type TrackEvent = { type: 'view'; path: string } | { type: 'click'; path: string; key: string }

export type Report = {
  path: string
  days: number
  views: number
  /** click key → count on `path`, over the period */
  clicks: Record<string, number>
  /** every recorded path → views, over the period (for the extension's page list) */
  pages: Record<string, number>
}

/** UTC day, e.g. 2026-11-20 */
export const dayOf = (d: Date) => d.toISOString().slice(0, 10)

const viewsKey = (day: string) => `a:${day}:views`
const clicksKey = (day: string) => `a:${day}:clicks`

const PATH_RE = /^\/[A-Za-z0-9\-._~/]{0,119}$/
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u001f\u007f]/

/** Validates an untrusted beacon body. Returns null when it is not something we record. */
export function parseEvent(body: unknown): TrackEvent | null {
  if (!body || typeof body !== 'object') return null
  const { type, path, key } = body as Record<string, unknown>
  if (typeof path !== 'string' || !PATH_RE.test(path)) return null
  if (type === 'view') return { type, path }
  if (type === 'click' && typeof key === 'string' && key.length > 0 && key.length <= 120 && !CONTROL_RE.test(key)) {
    return { type, path, key }
  }
  return null
}

export async function record(redis: Redis, event: TrackEvent, now = new Date()) {
  const day = dayOf(now)
  const p = redis.pipeline()
  if (event.type === 'view') {
    p.hincrby(viewsKey(day), event.path, 1)
    p.expire(viewsKey(day), TTL_SECONDS)
  } else {
    p.hincrby(clicksKey(day), `${event.path}${SEP}${event.key}`, 1)
    p.expire(clicksKey(day), TTL_SECONDS)
  }
  await p.exec()
}

export async function report(redis: Redis, path: string, days: number, now = new Date()): Promise<Report> {
  const dayList = Array.from({ length: days }, (_, i) => dayOf(new Date(now.getTime() - i * 86_400_000)))
  const p = redis.pipeline()
  for (const day of dayList) {
    p.hgetall(viewsKey(day))
    p.hgetall(clicksKey(day))
  }
  const rows = (await p.exec()) as Array<Record<string, number | string> | null>

  const pages: Record<string, number> = {}
  const clicks: Record<string, number> = {}
  rows.forEach((hash, i) => {
    if (!hash) return
    const isViews = i % 2 === 0
    for (const [field, raw] of Object.entries(hash)) {
      const n = Number(raw) || 0
      if (isViews) {
        pages[field] = (pages[field] ?? 0) + n
      } else {
        const at = field.indexOf(SEP)
        if (field.slice(0, at) !== path) continue
        const key = field.slice(at + 1)
        clicks[key] = (clicks[key] ?? 0) + n
      }
    }
  })
  return { path, days, views: pages[path] ?? 0, clicks, pages }
}
