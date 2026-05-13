'use server'

import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

export async function getTrafficStats(period: 'today' | 'yesterday' | 'week' | 'month' | 'all' = 'all') {
    await verifyAdmin()

    const now = new Date()
    let gte: Date | undefined
    let lte: Date | undefined

    if (period === 'today') {
        gte = new Date()
        gte.setHours(0, 0, 0, 0)
    } else if (period === 'yesterday') {
        gte = new Date()
        gte.setDate(gte.getDate() - 1)
        gte.setHours(0, 0, 0, 0)
        lte = new Date()
        lte.setHours(0, 0, 0, 0)
    } else if (period === 'week') {
        gte = new Date()
        gte.setDate(gte.getDate() - 7)
    } else if (period === 'month') {
        gte = new Date()
        gte.setMonth(gte.getMonth() - 1)
    }

    const where: any = {}
    if (gte || lte) {
        where.createdAt = {}
        if (gte) where.createdAt.gte = gte
        if (lte) where.createdAt.lt = lte
    }

    // 1. Total Page Views
    const totalViews = await prisma.pageView.count({ where })

    // 2. Unique Visitors (based on sessionId)
    const uniqueVisitors = await prisma.pageView.groupBy({
        by: ['sessionId'],
        where,
        _count: {
            sessionId: true
        }
    }).then(res => res.length)

    // 3. Top Pages
    const topPages = await prisma.pageView.groupBy({
        by: ['url'],
        where,
        _count: {
            url: true
        },
        orderBy: {
            _count: {
                url: 'desc'
            }
        },
        take: 20
    })

    // 4. Recent Activity (Pixel Matrix Style)
    const recentActivity = await prisma.pageView.findMany({
        where,
        take: 300, // On augmente la limite pour tout le monde
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
