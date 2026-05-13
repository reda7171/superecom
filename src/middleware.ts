import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

// Simple in-memory rate limit pour les routes API (OWASP)
// Note : En Edge Runtime, ce cache est limité par instance, mais bloque les bots rapides.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300; // 300 req/min par IP

export default function middleware(request: NextRequest) {
    // 0. Bloquer /api/seed en production (OWASP - Broken Access Control)
    if (request.nextUrl.pathname.startsWith('/api/seed')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // 0b. Rate limiting (OWASP) pour les routes API

    // Exclure les assets statiques du rate limit
    const isStaticAsset = request.nextUrl.pathname.startsWith('/_next/static');
    if (request.nextUrl.pathname.startsWith('/api/') && !isStaticAsset) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
        const now = Date.now();
        const clientData = rateLimitMap.get(ip);

        if (!clientData || (now - clientData.lastReset > RATE_LIMIT_WINDOW)) {
            rateLimitMap.set(ip, { count: 1, lastReset: now });
        } else {
            if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
                return new NextResponse('Too Many Requests - Rate limit exceeded', { status: 429 });
            }
            clientData.count++;
        }
    }
    // Rediriger les routes admin en arabe vers le français
    const pathname = request.nextUrl.pathname
    const role = request.cookies.get('admin-role')?.value
    const token = request.cookies.get('admin-token')?.value

    // Rediriger les influenceurs connectés vers leur dashboard s'ils tentent d'accéder à l'admin
    if (pathname.includes('/admin') && !pathname.includes('/admin/login') && role === 'INFLUENCER' && token) {
        const url = request.nextUrl.clone()
        const locale = pathname.split('/')[1] || 'fr'
        url.pathname = `/${locale}/influencer`
        return NextResponse.redirect(url)
    }

    // Protection inverse : rediriger les admins vers l'admin s'ils tentent d'accéder à /influencer
    if (pathname.includes('/influencer') && role !== 'INFLUENCER' && token) {
        const url = request.nextUrl.clone()
        const locale = pathname.split('/')[1] || 'fr'
        url.pathname = `/${locale}/admin`
        return NextResponse.redirect(url)
    }

    // Rediriger les routes admin en arabe vers le français
    if (pathname.startsWith('/ar/admin')) {
        const newUrl = request.nextUrl.clone()
        newUrl.pathname = pathname.replace('/ar/admin', '/fr/admin')
        return NextResponse.redirect(newUrl)
    }

    // 1. D'abord exécuter le middleware next-intl pour gérer la locale
    const response = intlMiddleware(request)

    // 2. Ajouter les headers de sécurité (OWASP)
    // CSP - unsafe-eval autorisé en dev pour React/Turbopack, bloqué en production
    const isDev = process.env.NODE_ENV === 'development'
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://pagead2.googlesyndication.com`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "media-src 'self' https://assets.mixkit.co",
            "connect-src 'self' https:",
            "frame-src 'self' https://www.google.com https://maps.googleapis.com https://maps.google.com https://pagead2.googlesyndication.com",
            "worker-src 'none'",
            "object-src 'none'",
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
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
}
