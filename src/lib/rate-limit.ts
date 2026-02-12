/**
 * Simple In-Memory Rate Limiter for Server Actions/API Routes
 * Note: In a multi-instance/serverless environment, this is local to each instance.
 * For a distributed solution, use Redis.
 */

const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

interface RateLimitOptions {
    limit: number      // Number of requests
    windowMs: number   // Window duration in milliseconds
}

export async function rateLimit(identifier: string, options: RateLimitOptions = { limit: 10, windowMs: 60000 }) {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    if (!record) {
        rateLimitMap.set(identifier, { count: 1, lastReset: now })
        return { success: true }
    }

    if (now - record.lastReset > options.windowMs) {
        // Reset window
        rateLimitMap.set(identifier, { count: 1, lastReset: now })
        return { success: true }
    }

    if (record.count >= options.limit) {
        return { success: false, limit: options.limit }
    }

    record.count++
    return { success: true }
}

/**
 * Get IP identifier (best effort in Next.js)
 */
export async function getIpIdentifier() {
    try {
        const { headers } = await import('next/headers')
        const headerList = await headers()
        return headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'anonymous'
    } catch (e) {
        return 'anonymous'
    }
}
