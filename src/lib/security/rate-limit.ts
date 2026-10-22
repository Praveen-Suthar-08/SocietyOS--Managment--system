interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  intervalMs: number; // Duration of window
  maxRequests: number; // Max requests allowed per window
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { intervalMs: 60 * 1000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + options.intervalMs,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetInMs: options.intervalMs,
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// Periodic cleanup of expired rate limit keys to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}
