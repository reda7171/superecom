import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Forcer l'admin à toujours utiliser /fr/admin
    if (pathname.includes('/admin')) {
        // Si c'est /ar/admin ou /en/admin, rediriger vers /fr/admin
        if (pathname.startsWith('/ar/admin') || pathname.startsWith('/en/admin')) {
            const newPath = pathname.replace(/^\/(ar|en)\/admin/, '/fr/admin');
            return NextResponse.redirect(new URL(newPath, request.url));
        }
        // Si c'est juste /admin sans locale, rediriger vers /fr/admin
        if (pathname === '/admin' || pathname.startsWith('/admin/')) {
            const newPath = `/fr${pathname}`;
            return NextResponse.redirect(new URL(newPath, request.url));
        }
    }

    const response = handleI18nRouting(request);

    // Apply strict Content Security Policy
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.unsplash.com https://res.cloudinary.com https://lh3.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    `

    response.headers.set(
        'Content-Security-Policy',
        cspHeader.replace(/\s{2,}/g, ' ').trim()
    );

    // X-Frame-Options: Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // X-Content-Type-Options: Prevent MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), browsing-topics=()'
    );

    // Strict-Transport-Security: Force HTTPS
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    return response;
}

export const config = {
    // Matcher générique pour intercepter toutes les routes et gérer la locale
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
