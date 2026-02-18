'use server'

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function trackPageView(data: {
    url: string
    referrer: string | null
    userId?: string
    sessionId?: string
}) {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || null

        await prisma.pageView.create({
            data: {
                url: data.url,
                referrer: data.referrer,
                userId: data.userId || null,
                sessionId: data.sessionId || null,
                userAgent: userAgent
            }
        })
    } catch (error) {
        console.error('Tracking Error:', error)
    }
}
