// Lightweight in-memory rate limiter for Cloudflare Workers.
// Sufficient for a low-traffic CMS (1-2 users). For high-traffic or
// multi-region consistency, upgrade to Cloudflare KV + hono-rate-limiter.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Clean up expired entries every 60 seconds to prevent memory leak
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitOptions {
  windowMs: number; // time window in milliseconds
  maxRequests: number; // max requests within the window
}

export function createRateLimiter(opts: RateLimitOptions) {
  return (identifier: string): { allowed: boolean; retryAfter: number } => {
    cleanup();
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetAt) {
      store.set(identifier, { count: 1, resetAt: now + opts.windowMs });
      return { allowed: true, retryAfter: 0 };
    }

    entry.count += 1;
    if (entry.count > opts.maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }

    return { allowed: true, retryAfter: 0 };
  };
}
