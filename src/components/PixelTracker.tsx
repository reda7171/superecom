'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/actions/tracking'

export default function PixelTracker({ userId }: { userId?: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname.includes('/admin')) return

        // Debounce or just fire? Fire for now.
        const url = `${window.location.host}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const referrer = document.referrer || null

        // Generate a random session ID if not exists
        let sessionId = sessionStorage.getItem('riwaya_session_id')
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
            sessionStorage.setItem('riwaya_session_id', sessionId)
        }

        // Call Server Action
        trackPageView({
            url,
            referrer,
            userId,
            sessionId
        })

    }, [pathname, searchParams, userId])

    return null
}
