'use server'

import { prisma } from '@/lib/prisma'

// Badge tracking
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

/**
 * Statistiques générales du dashboard
 */
export async function getDashboardStats() {
    try {
        const [
            totalOrders,
            totalRevenue,
            totalBooks,
            totalPacks,
            pendingOrders,
            deliveredOrders,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { total: true },
            }),
            prisma.book.count({ where: { active: true } }),
            prisma.pack.count({ where: { active: true } }),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
        ])

        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            totalBooks,
            totalPacks,
            pendingOrders,
            deliveredOrders,
        }
    } catch (error) {
        console.error('Erreur stats dashboard:', error)
        return {
            totalOrders: 0,
            totalRevenue: 0,
            totalBooks: 0,
            totalPacks: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
        }
    }
}

/**
 * Évolution du CA par période
 */
export async function getRevenueByPeriod(period: 'day' | 'week' | 'month' = 'day') {
    try {
        const now = new Date()
        let startDate = new Date()

        // Définir la période
        if (period === 'day') {
            startDate.setDate(now.getDate() - 7) // 7 derniers jours
        } else if (period === 'week') {
            startDate.setDate(now.getDate() - 28) // 4 dernières semaines
        } else {
            startDate.setMonth(now.getMonth() - 12) // 12 derniers mois
        }

        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
                status: {
                    not: 'CANCELLED',
                },
            },
            select: {
                createdAt: true,
                total: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        // Grouper par période
        const revenueMap = new Map<string, number>()

        orders.forEach((order) => {
            const date = new Date(order.createdAt)
            let key: string

            if (period === 'day') {
                key = date.toISOString().split('T')[0] // YYYY-MM-DD
            } else if (period === 'week') {
                const weekNum = getWeekNumber(date)
                key = `S${weekNum}`
            } else {
                const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
                key = months[date.getMonth()]
            }

            revenueMap.set(key, (revenueMap.get(key) || 0) + order.total)
        })

        // Convertir en tableau
        return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
            date,
            revenue: Math.round(revenue * 100) / 100,
        }))
    } catch (error) {
        console.error('Erreur évolution CA:', error)
        return []
    }
}

/**
 * Top produits vendus
 */
export async function getTopProducts(limit = 10) {
    try {
        const orderItems = await prisma.orderItem.findMany({
            include: {
                order: {
                    select: {
                        status: true,
                    },
                },
            },
        })

        // Filtrer les commandes non annulées
        const validItems = orderItems.filter((item) => item.order.status !== 'CANCELLED')

        // Grouper par produit
        const productStats = new Map<
            string,
            { productId: string; type: string; quantity: number; revenue: number }
        >()

        validItems.forEach((item) => {
            const productId = item.type === 'BOOK' ? item.bookId : item.packId
            if (!productId) return

            const key = `${item.type}-${productId}`
            const existing = productStats.get(key)

            if (existing) {
                existing.quantity += item.quantity
                existing.revenue += item.price * item.quantity
            } else {
                productStats.set(key, {
                    productId,
                    type: item.type,
                    quantity: item.quantity,
                    revenue: item.price * item.quantity,
                })
            }
        })

        // Récupérer les détails des produits
        const topProducts = await Promise.all(
            Array.from(productStats.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, limit)
                .map(async (stat) => {
                    if (stat.type === 'BOOK') {
                        const book = await prisma.book.findUnique({
                            where: { id: stat.productId },
                            select: { title: true, image: true, price: true },
                        })
                        return {
                            ...stat,
                            name: book?.title || 'Livre supprimé',
                            image: book?.image || '',
                            price: book?.price || 0,
                        }
                    } else {
                        const pack = await prisma.pack.findUnique({
                            where: { id: stat.productId },
                            select: { name: true, image: true, price: true },
                        })
                        return {
                            ...stat,
                            name: pack?.name || 'Pack supprimé',
                            image: pack?.image || '',
                            price: pack?.price || 0,
                        }
                    }
                })
        )

        return topProducts
    } catch (error) {
        console.error('Erreur top produits:', error)
        return []
    }
}

/**
 * Taux de conversion (commandes livrées / total commandes)
 */
export async function getConversionRate() {
    try {
        const [total, delivered] = await Promise.all([
            prisma.order.count({
                where: {
                    status: {
                        not: 'CANCELLED',
                    },
                },
            }),
            prisma.order.count({
                where: {
                    status: 'DELIVERED',
                },
            }),
        ])

        const rate = total > 0 ? (delivered / total) * 100 : 0

        return {
            total,
            delivered,
            rate: Math.round(rate * 100) / 100,
        }
    } catch (error) {
        console.error('Erreur taux de conversion:', error)
        return { total: 0, delivered: 0, rate: 0 }
    }
}

/**
 * Distribution des statuts de commandes
 */
export async function getOrderStatusDistribution() {
    try {
        const statuses = await prisma.order.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        })

        return statuses.map((s) => ({
            status: s.status,
            count: s._count.id,
        }))
    } catch (error) {
        console.error('Erreur distribution statuts:', error)
        return []
    }
}

// Helper: Obtenir le numéro de semaine
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
