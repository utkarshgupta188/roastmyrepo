/**
 * Simple in-memory rate limiter.
 * Works per serverless instance — provides basic DDoS protection.
 * For global limiting across instances, use Upstash/Redis.
 *
 * Default: 5 requests per IP per 60 seconds.
 */

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;       // per window per IP

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now - entry.windowStart > WINDOW_MS) {
            store.delete(key);
        }
    }
}, WINDOW_MS);

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
        // New window
        store.set(ip, { count: 1, windowStart: now });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    if (entry.count >= MAX_REQUESTS) {
        const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
        return { allowed: false, retryAfterSeconds };
    }

    entry.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
}
