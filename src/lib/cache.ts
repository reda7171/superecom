/**
 * Cache simple en mémoire pour les requêtes fréquentes
 * En production, utiliser Redis ou Memcached
 */

interface CacheEntry<T> {
    data: T
    expiry: number
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<any>>()
    private maxSize = 1000 // Limite pour éviter memory leak

    set<T>(key: string, data: T, ttlSeconds: number = 300): void {
        // Nettoyer si trop d'entrées
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlSeconds * 1000,
        })
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            return null
        }

        // Vérifier expiration
        if (Date.now() > entry.expiry) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    delete(key: string): void {
        this.cache.delete(key)
    }

    clear(): void {
        this.cache.clear()
    }

    // Nettoyer les entrées expirées
    cleanup(): void {
        const now = Date.now()
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key)
            }
        }
    }
}

// Instance singleton
export const cache = new MemoryCache()

// Nettoyer toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

/**
 * Helper pour cache avec fonction
 */
export async function getCached<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
): Promise<T> {
    // Vérifier cache
    const cached = cache.get<T>(key)
    if (cached !== null) {
        return cached
    }

    // Fetch et mettre en cache
    const data = await fetchFn()
    cache.set(key, data, ttlSeconds)
    return data
}

/**
 * Générer une clé de cache stable
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${JSON.stringify(params[key])}`)
        .join('&')

    return `${prefix}:${sortedParams}`
}
