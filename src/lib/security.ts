/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
    if (!input) return ''

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
}

/**
 * Sanitize HTML content (for rich text editors)
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''

    // Liste blanche des balises autorisées
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img']
    const allowedAttributes = ['href', 'src', 'alt', 'title', 'class']

    // Supprimer les scripts
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // Supprimer les événements inline (onclick, onerror, etc.)
    cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '')

    // Supprimer javascript: dans les URLs
    cleaned = cleaned.replace(/javascript:/gi, '')

    return cleaned
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number (Moroccan format)
 */
export function isValidPhone(phone: string): boolean {
    // Format marocain: +212XXXXXXXXX ou 0XXXXXXXXX
    const phoneRegex = /^(\+212|0)[5-7]\d{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .replace(/^\.+/, '')
        .slice(0, 255)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
        return false
    }
}

/**
 * Escape SQL-like patterns (for LIKE queries)
 */
export function escapeSqlLike(input: string): string {
    return input.replace(/[%_\\]/g, '\\$&')
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomValues = new Uint8Array(length)

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomValues)
        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length]
        }
    } else {
        // Fallback (moins sécurisé)
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)]
        }
    }

    return result
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
    if (!query) return ''

    return query
        .trim()
        .slice(0, 100) // Limite de longueur
        .replace(/[<>]/g, '') // Supprimer les chevrons
        .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF-]/g, '') // Garder uniquement lettres, chiffres, espaces, arabe
}

/**
 * Hash sensitive data (for logging)
 */
export function hashForLogging(data: string): string {
    if (!data) return ''

    // Simple hash pour masquer les données sensibles dans les logs
    const visible = data.slice(0, 3)
    const masked = '*'.repeat(Math.min(data.length - 3, 10))

    return visible + masked
}
