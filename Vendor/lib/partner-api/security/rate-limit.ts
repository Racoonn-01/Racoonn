import { PartnerEnvironment } from '../types';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitBucket>();

/**
 * Token bucket rate limiter:
 * Production: 1000 requests per minute
 * Sandbox: 100 requests per minute
 */
export function checkRateLimit(
  keyId: string,
  environment: PartnerEnvironment,
  customLimit?: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const maxLimit = customLimit && customLimit > 0
    ? customLimit
    : environment === 'production' ? 1000 : 100;

  const now = Date.now();
  const windowMs = 60 * 1000;
  const refillRatePerMs = maxLimit / windowMs;

  let bucket = buckets.get(keyId);
  if (!bucket) {
    bucket = { tokens: maxLimit, lastRefill: now };
    buckets.set(keyId, bucket);
  }

  // Refill tokens
  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(maxLimit, bucket.tokens + elapsed * refillRatePerMs);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfterSeconds: 0,
    };
  }

  // Rate limited
  const missingTokens = 1 - bucket.tokens;
  const retryAfterSeconds = Math.ceil(missingTokens / (refillRatePerMs * 1000)) || 1;

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds,
  };
}
