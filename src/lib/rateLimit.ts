import { NextRequest } from 'next/server';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory sliding window cache for local development & fallback
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return (req as any).ip || '127.0.0.1';
}

export type RateLimitTier = 'auth' | 'booking' | 'sensitive' | 'general';

const TIER_CONFIG: Record<RateLimitTier, { limit: number; windowSeconds: number }> = {
  auth: { limit: 10, windowSeconds: 60 }, // 10 attempts / 1 min (anti-bruteforce)
  sensitive: { limit: 5, windowSeconds: 300 }, // 5 attempts / 5 mins (password reset)
  booking: { limit: 20, windowSeconds: 60 }, // 20 requests / 1 min
  general: { limit: 120, windowSeconds: 60 }, // 120 requests / 1 min
};

/**
 * Checks rate limit for a request using Upstash Redis if configured,
 * otherwise falling back gracefully to sliding window in-memory store.
 */
export async function checkRateLimit(
  req: NextRequest,
  tier: RateLimitTier = 'general',
  identifier?: string
): Promise<RateLimitResult> {
  const ip = identifier || getClientIp(req);
  const key = `ratelimit:${tier}:${ip}`;
  const config = TIER_CONFIG[tier];
  const now = Math.floor(Date.now() / 1000);

  // 1. If Upstash Redis REST credentials are provided in Vercel environment
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      // INCR command with pipeline or multi via Upstash REST API
      const res = await fetch(`${upstashUrl}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
      const data = await res.json();
      const count = Number(data.result);

      if (count === 1) {
        // Set expiry on first increment
        await fetch(`${upstashUrl}/expire/${encodeURIComponent(key)}/${config.windowSeconds}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
      }

      const remaining = Math.max(0, config.limit - count);
      return {
        success: count <= config.limit,
        limit: config.limit,
        remaining,
        reset: now + config.windowSeconds,
      };
    } catch (err) {
      console.warn('[RateLimit] Upstash probe failed, falling back to in-memory store:', err);
    }
  }

  // 2. In-memory sliding window fallback
  const record = inMemoryStore.get(key);

  if (!record || record.resetAt <= now) {
    const resetAt = now + config.windowSeconds;
    inMemoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetAt,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, config.limit - record.count);
  return {
    success: record.count <= config.limit,
    limit: config.limit,
    remaining,
    reset: record.resetAt,
  };
}
