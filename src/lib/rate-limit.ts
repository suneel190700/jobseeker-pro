// Simple in-memory rate limiter for API routes
// For production at scale, replace with Upstash Redis (@upstash/ratelimit)

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULTS: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
};

export function rateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { success: boolean; remaining: number; resetIn: number } {
  const { windowMs, maxRequests } = { ...DEFAULTS, ...config };
  const now = Date.now();

  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    rateLimitMap.forEach((val, key) => {
      if (now > val.resetTime) rateLimitMap.delete(key);
    });
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

// Pre-configured limiters for different endpoints
export const resumeAnalysisLimit = (userId: string) =>
  rateLimit(`resume:${userId}`, { windowMs: 60_000, maxRequests: 5 });

export const jobSearchLimit = (userId: string) =>
  rateLimit(`jobs:${userId}`, { windowMs: 60_000, maxRequests: 30 });
