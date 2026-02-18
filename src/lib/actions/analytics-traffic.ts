'use server'

import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

export async function getTrafficStats() {
    await verifyAdmin()

    // 1. Total Page Views
    const totalViews = await prisma.pageView.count()

    // 2. Unique Visitors (based on sessionId)
    const uniqueVisitors = await prisma.pageView.groupBy({
        by: ['sessionId'],
        _count: {
            sessionId: true
        }
    }).then(res => res.length)

    // 3. Top Pages
    const topPages = await prisma.pageView.groupBy({
        by: ['url'],
        _count: {
            url: true
        },
        orderBy: {
            _count: {
                url: 'desc'
            }
        },
        take: 10
    })

    // 4. Recent Activity (Pixel Matrix Style)
    const recentActivity = await prisma.pageView.findMany({
        take: 50,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true
                }
            }
        }
    })

    return {
        totalViews,
        uniqueVisitors,
        topPages: topPages.map(p => ({ url: p.url, count: p._count.url })),
        recentActivity
    }
}
