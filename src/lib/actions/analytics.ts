'use server'

import { prisma } from '@/lib/prisma'

export async function trackBadgeClick(badge: string, category: string) {
    if (!badge || !category) return

    try {
        await (prisma as any).badgeClick.create({
            data: {
                badge,
                category
            }
        })
    } catch (error) {
        console.error('Erreur tracking badge:', error)
    }
}

export async function getBadgeStats() {
    try {
        const clicks = await (prisma as any).badgeClick.groupBy({
            by: ['badge'],
            _count: {
                badge: true
            },
            orderBy: {
                _count: {
                    badge: 'desc'
                }
            }
        })

        return clicks.map((c: any) => ({
            name: c.badge,
            value: c._count.badge
        }))
    } catch (error) {
        return []
    }
}
