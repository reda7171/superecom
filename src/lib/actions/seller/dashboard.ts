'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { revalidatePath } from 'next/cache'

/**
 * Récupère les stats du dashboard vendeur
 */
export async function getSellerDashboardData() {
    const user = await getCommunityUser()
    if (!user || user.role !== 'SELLER') throw new Error('Non autorisé')

    const [booksCount, ordersCount, recentOrders] = await Promise.all([
        prisma.product.count({ where: { sellerId: user.id } }),
        prisma.order.count({ where: { sellerId: user.id } }),
        prisma.order.findMany({
            where: { sellerId: user.id },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: { select: { title: true } }
                    }
                }
            }
        })
    ])

    // Calcul du CA
    const orders = await prisma.order.findMany({
        where: { sellerId: user.id, status: 'DELIVERED' },
        select: { total: true }
    })
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

    return {
        booksCount,
        ordersCount,
        recentOrders,
        totalRevenue
    }
}

/**
 * Récupère les livres du vendeur
 */
export async function getSellerBooks() {
    const user = await getCommunityUser()
    if (!user || user.role !== 'SELLER') throw new Error('Non autorisé')

    return prisma.product.findMany({
        where: { sellerId: user.id },
        orderBy: { createdAt: 'desc' }
    })
}

/**
 * Récupère les commandes du vendeur
 */
export async function getSellerOrders() {
    const user = await getCommunityUser()
    if (!user || user.role !== 'SELLER') throw new Error('Non autorisé')

    return prisma.order.findMany({
        where: { sellerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: { select: { title: true, image: true, price: true } }
                }
            }
        }
    })
}

/**
 * Créer un livre ( Marketplace )
 */
export async function createSellerBook(data: any) {
    const user = await getCommunityUser()
    if (!user || user.role !== 'SELLER') throw new Error('Non autorisé')

    const product = await prisma.product.create({
        data: {
            ...data,
            sellerId: user.id,
            active: false,
            status: 'PENDING'
        }
    })

    revalidatePath('/seller/products')
    return { success: true, product }
}
