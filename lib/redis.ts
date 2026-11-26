import { Redis } from '@upstash/redis'

/**
 * The one Upstash client (demo rate limit, click analytics). Vercel's Marketplace may name the
 * vars either way. Null without them (local dev): callers treat that as "feature off".
 */
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

export const redis: Redis | null = url && token ? new Redis({ url, token }) : null
