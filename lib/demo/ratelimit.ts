import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

/**
 * Per-visitor limit so one person can't drain the shared free model quota.
 * Upstash free tier. Without Redis the limiter is off (local dev) — the free providers'
 * own quotas still apply.
 */
const limiter =
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '10 m'),
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
