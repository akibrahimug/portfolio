/**
 * Simple in-memory token bucket per user.
 * - Capacity: RATE_LIMIT_RPM tokens
 * - Refill: linear over time
 */
import config from '../config';

interface Bucket {
  tokens: number;
  lastRefill: number; // epoch ms
}

const buckets = new Map<string, Bucket>();

function refill(bucket: Bucket, now: number): void {
  const capacity = Math.max(1, config.rateLimit.rpm);
  const perMs = capacity / 60000; // tokens per ms
  const delta = now - bucket.lastRefill;
  if (delta <= 0) return;
  bucket.tokens = Math.min(capacity, bucket.tokens + delta * perMs);
  bucket.lastRefill = now;
}

export function consume(userId: string, cost = 1): boolean {
  const capacity = Math.max(1, config.rateLimit.rpm);
  const now = Date.now();
  let bucket = buckets.get(userId);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(userId, bucket);
  }
  refill(bucket, now);
  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return true;
  }
  return false;
}

// Test helper to reset internal state
export function __resetBucketsForTest() {
  buckets.clear();
}
