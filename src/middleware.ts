import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
    // Rediriger les routes admin en arabe vers le français
    const pathname = request.nextUrl.pathname
    if (pathname.startsWith('/ar/admin')) {
        const newUrl = request.nextUrl.clone()
        newUrl.pathname = pathname.replace('/ar/admin', '/fr/admin')
        return NextResponse.redirect(newUrl)
    }

    // 1. D'abord exécuter le middleware next-intl pour gérer la locale
    const response = intlMiddleware(request)

    // 2. Ajouter les headers de sécurité (OWASP)
    // Content Security Policy (CSP)
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ')
    )

    // X-Frame-Options (Clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY')

    // X-Content-Type-Options (MIME sniffing protection)
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions-Policy
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self), payment=(self)'
    )

    // X-XSS-Protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Strict-Transport-Security (HSTS)
    if (request.nextUrl.protocol === 'https:') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        )
    }

    // Remove X-Powered-By header
    response.headers.delete('X-Powered-By')

    // 3. CSRF Protection for state-changing requests
    const isStateMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

    if (isStateMutating && isApiRoute) {
        const origin = request.headers.get('origin')
        const host = request.headers.get('host')

        // Vérifier que l'origine correspond au host
        if (origin && !origin.includes(host || '')) {
            return new NextResponse('CSRF validation failed', { status: 403 })
        }
    }

    return response
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(fr|en|ar)/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/en/pathnames`)
        '/((?!_next|_vercel|.*\\..*).*)'
    ]
}
