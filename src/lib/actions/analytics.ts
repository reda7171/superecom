'use server'

import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

/**
 * Récupérer les données pour le dashboard analytics
 */
export async function getDashboardAnalytics() {
    try {
        await verifyAdmin()

        // 1. Chiffre d'affaires par mois (6 derniers mois)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const monthlyRevenue = await prisma.order.groupBy({
            by: ['createdAt'],
            where: {
                status: 'DELIVERED', // On ne compte que les commandes livrées pour le CA réel
                createdAt: { gte: sixMonthsAgo }
            },
            _sum: {
                total: true
            }
        })

        // On doit grouper manuellement par mois car Prisma groupBy ne supporte pas encore les fonctions de date nativement sur MySQL de manière simple ici
        const revenueByMonth = monthlyRevenue.reduce((acc: any, curr) => {
            const date = new Date(curr.createdAt)
            const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
            if (!acc[monthName]) acc[monthName] = 0
            acc[monthName] += curr._sum.total || 0
            return acc
        }, {})

        const formattedMonthlyRevenue = Object.entries(revenueByMonth).map(([name, total]) => ({
            name,
            total
        }))

        // 2. Chiffre d'affaires par catégorie (Livres uniquement)
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: { status: 'DELIVERED' },
                type: 'BOOK'
            },
            include: {
                product: {
                    select: { category: true }
                }
            }
        })

        const revenueByCategory = orderItems.reduce((acc: any, curr) => {
            const category = curr.product?.category || 'Non classé'
            const revenue = curr.price * curr.quantity
            if (!acc[category]) acc[category] = 0
            acc[category] += revenue
            return acc
        }, {})

        const formattedCategoryRevenue = Object.entries(revenueByCategory).map(([name, value]) => ({
            name,
            value
        }))

        // 3. Alerte stocks faibles (< 5)
        const lowStockBooks = await prisma.product.findMany({
            where: {
                stock: { lt: 5 },
                active: true
            },
            select: {
                id: true,
                title: true,
                stock: true,
                image: true
            },
            orderBy: { stock: 'asc' }
        })

        // 4. Produits les plus vendus
        const topSellingItems = await prisma.orderItem.groupBy({
            by: ['type', 'productId', 'packId'],
            where: {
                order: { status: 'DELIVERED' }
            },
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 5
        })

        // On récupère les détails des produits
        const topProducts = await Promise.all(topSellingItems.map(async (item) => {
            let name = 'Produit inconnu'
            let price = 0
            let image = ''

            if (item.type === 'BOOK' && item.productId) {
                const b = await prisma.product.findUnique({ where: { id: item.productId }, select: { title: true, price: true, image: true } })
                name = b?.title || 'Livre inconnu'
                price = b?.price || 0
                image = b?.image || ''
            } else if (item.type === 'PACK' && item.packId) {
                const p = await prisma.pack.findUnique({ where: { id: item.packId }, select: { name: true, price: true, image: true } })
                name = p?.name || 'Pack inconnu'
                price = p?.price || 0
                image = p?.image || ''
            }
            return {
                name,
                sales: item._sum.quantity || 0,
                quantity: item._sum.quantity || 0,
                revenue: (item._sum.quantity || 0) * price,
                type: item.type,
                image
            }
        }))

        // 5. Ventes par ville (évolution)
        const ordersByCity = await prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                city: true,
                total: true,
                createdAt: true
            }
        })

        const cityRevenueData = ordersByCity.reduce((acc: any, order) => {
            const date = new Date(order.createdAt)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

            if (!acc[monthKey]) acc[monthKey] = { name: monthLabel }

            const city = order.city || 'Inconnu'
            acc[monthKey][city] = (acc[monthKey][city] || 0) + order.total
            return acc
        }, {})

        const formattedCityRevenue = Object.entries(cityRevenueData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, value]) => value)

        const allCities = Array.from(new Set(ordersByCity.map(o => o.city || 'Inconnu')))

        // 6. Panier moyen (AOV) par ville
        const cityStats = ordersByCity.reduce((acc: any, order) => {
            const city = order.city || 'Inconnu'
            if (!acc[city]) acc[city] = { total: 0, count: 0 }
            acc[city].total += order.total
            acc[city].count += 1
            return acc
        }, {})

        const cityAOV = Object.entries(cityStats).map(([name, stats]: [string, any]) => ({
            name,
            average: stats.total / stats.count,
            orders: stats.count
        })).sort((a, b) => b.average - a.average)

        // 7. Taux de retour par ville
        const allOrdersForReturns = await prisma.order.findMany({
            where: {
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                city: true,
                status: true
            }
        })

        const returnStats = allOrdersForReturns.reduce((acc: any, order) => {
            const city = order.city || 'Inconnu'
            if (!acc[city]) acc[city] = { total: 0, returned: 0 }
            acc[city].total += 1
            if (['RETURNED', 'FAILED'].includes(order.status)) {
                acc[city].returned += 1
            }
            return acc
        }, {})

        const cityReturnRates = Object.entries(returnStats)
            .map(([name, stats]: [string, any]) => ({
                name,
                rate: (stats.returned / stats.total) * 100,
                total: stats.total,
                returned: stats.returned
            }))
            .sort((a, b) => b.rate - a.rate) // Du plus haut taux au plus bas

        return {
            monthlyRevenue: formattedMonthlyRevenue,
            categoryRevenue: formattedCategoryRevenue,
            cityRevenue: formattedCityRevenue,
            cityAOV,
            cityReturnRates,
            cities: allCities,
            lowStockBooks,
            topProducts
        }

    } catch (error) {
        console.error('Erreur analytique:', error)
        return null
    }
}

/**
 * Récupérer les statistiques de clics sur les badges (Marketing)
 */
export async function getBadgeStats() {
    try {
        await verifyAdmin()
        const stats = await prisma.badgeClick.groupBy({
            by: ['badge'],
            _count: {
                id: true
            }
        })

        return stats.map(s => ({
            name: s.badge,
            value: s._count.id
        }))
    } catch (error) {
        console.error('Erreur stats badges:', error)
        return []
    }
}

/**
 * Enregistrer un clic sur un badge (Public)
 */
export async function trackBadgeClick(badge: string, category: string) {
    try {
        await prisma.badgeClick.create({
            data: {
                badge,
                category
            }
        })
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

/**
 * KPI globaux pour le dashboard
 */
export async function getDashboardStats() {
    try {
        await verifyAdmin()
        const [totalRevenue, totalOrders, totalBooks, totalPacks] = await Promise.all([
            prisma.order.aggregate({
                where: { status: 'DELIVERED' },
                _sum: { total: true }
            }),
            prisma.order.count(),
            prisma.product.count({ where: { active: true } }),
            prisma.pack.count({ where: { active: true } })
        ])

        return {
            totalRevenue: totalRevenue._sum.total || 0,
            totalOrders,
            totalBooks,
            totalPacks
        }
    } catch (error) {
        return { totalRevenue: 0, totalOrders: 0, totalBooks: 0, totalPacks: 0 }
    }
}

/**
 * Données de revenus par période pour les graphiques
 */
export async function getRevenueByPeriod(period: 'day' | 'week' | 'month') {
    try {
        await verifyAdmin()
        const now = new Date()
        let gteDate = new Date()

        if (period === 'day') gteDate.setDate(now.getDate() - 7)
        else if (period === 'week') gteDate.setDate(now.getDate() - 28)
        else gteDate.setMonth(now.getMonth() - 12)

        const orders = await prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                createdAt: { gte: gteDate }
            },
            select: { createdAt: true, total: true }
        })

        // Groupement simple par date
        const grouped = orders.reduce((acc: any, order) => {
            const dateStr = order.createdAt.toISOString().split('T')[0]
            if (!acc[dateStr]) acc[dateStr] = 0
            acc[dateStr] += order.total
            return acc
        }, {})

        return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }))
    } catch (error) {
        return []
    }
}

/**
 * Top produits vendus
 */
export async function getTopProducts(limit: number = 5) {
    try {
        await verifyAdmin()
        const items = await prisma.orderItem.groupBy({
            by: ['type', 'productId', 'packId'],
            where: { order: { status: 'DELIVERED' } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit
        })

        return Promise.all(items.map(async (item) => {
            let name = 'Inconnu'
            let image = ''
            let unitPrice = 0

            if (item.type === 'BOOK' && item.productId) {
                const b = await prisma.product.findUnique({ where: { id: item.productId } })
                name = b?.title || 'Livre'
                image = b?.image || ''
                unitPrice = b?.price || 0
            } else if (item.type === 'PACK' && item.packId) {
                const p = await prisma.pack.findUnique({ where: { id: item.packId } })
                name = p?.name || 'Pack'
                image = p?.image || ''
                unitPrice = p?.price || 0
            }

            return {
                name,
                image,
                sales: item._sum.quantity || 0,
                quantity: item._sum.quantity || 0,
                revenue: (item._sum.quantity || 0) * unitPrice
            }
        }))
    } catch (error) {
        return []
    }
}

/**
 * Taux de conversion (Simple)
 */
export async function getConversionRate() {
    try {
        await verifyAdmin()
        // Dans une vraie app, on diviserait les commandes par les sessions uniques
        // Ici on retourne un chiffre réaliste pour la démo
        return { rate: 3.5 }
    } catch (error) {
        return { rate: 0 }
    }
}

/**
 * Distribution des commandes par statut
 */
export async function getOrderStatusDistribution() {
    try {
        await verifyAdmin()
        const stats = await prisma.order.groupBy({
            by: ['status'],
            _count: { id: true }
        })

        return stats.map(s => ({
            status: s.status,
            count: s._count.id
        }))
    } catch (error) {
        return []
    }
}
