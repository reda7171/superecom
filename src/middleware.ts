import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Routes admin à protéger
    if (pathname.startsWith('/admin')) {
        // Vérifier si l'utilisateur est authentifié
        const token = request.cookies.get('admin-token')

        // Si pas de token et pas sur la page de login, rediriger
        if (!token && pathname !== '/admin/login') {
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Si token présent et sur la page de login, rediriger vers dashboard
        if (token && pathname === '/admin/login') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
