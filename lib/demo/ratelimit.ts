import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Per-visitor limit so one person can't drain the shared free model quota.
 * Upstash free tier; Vercel's Marketplace may name the vars either way. Without them the
 * limiter is off (local dev) — the free providers' own quotas still apply.
 */
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

const limiter =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(12, '10 m'),
        prefix: 'demo',
        // Rejections are cached in memory per instance: an abuser stops costing Redis calls.
        ephemeralCache: new Map(),
      })
    : null

export const rateLimitEnabled = limiter !== null

export async function allow(identifier: string): Promise<boolean> {
  if (!limiter) return true
  try {
    const { success } = await limiter.limit(identifier)
    return success
  } catch {
    return true // Redis hiccup: fail open; the providers' quotas are the backstop
  }
}
