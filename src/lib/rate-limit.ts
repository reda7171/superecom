import { headers } from 'next/headers'

// Configuration rate limiting
interface RateLimitConfig {
    limit: number // Nombre max de requêtes
    windowMs: number // Fenêtre de temps en ms
}

// Store simple en mémoire (pour production, utiliser Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 */
export async function rateLimit(
    key: string,
    config: RateLimitConfig = { limit: 100, windowMs: 60000 }
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const record = rateLimitStore.get(key)

    // Nettoyer les anciennes entrées
    if (record && now > record.resetTime) {
        rateLimitStore.delete(key)
    }

    const currentRecord = rateLimitStore.get(key)

    if (!currentRecord) {
        // Première requête
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        })
        return {
            success: true,
            remaining: config.limit - 1,
            resetTime: now + config.windowMs,
        }
    }

    if (currentRecord.count >= config.limit) {
        // Limite atteinte
        return {
            success: false,
            remaining: 0,
            resetTime: currentRecord.resetTime,
        }
    }

    // Incrémenter le compteur
    currentRecord.count++
    return {
        success: true,
        remaining: config.limit - currentRecord.count,
        resetTime: currentRecord.resetTime,
    }
}

/**
 * Obtenir l'identifiant IP du client
 */
export async function getIpIdentifier(): Promise<string> {
    const headersList = await headers()

    // Essayer différents headers pour obtenir l'IP réelle
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const cfConnectingIp = headersList.get('cf-connecting-ip') // Cloudflare

    const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'

    return ip.trim()
}

/**
 * Nettoyer périodiquement le store (à appeler via cron ou interval)
 */
export function cleanupRateLimitStore() {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Nettoyer toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
