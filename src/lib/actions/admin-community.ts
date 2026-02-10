'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './auth'

// Statistiques du dashboard
export async function getAdminStats() {
    try {
        await verifyAdmin()

        const [
            totalUsers,
            totalBooks,
            totalExchanges,
            pendingExchanges,
            acceptedExchanges,
            rejectedExchanges,
            completedExchanges,
            totalRatings,
            totalMessages
        ] = await Promise.all([
            prisma.user.count(),
            (prisma as any).exchangeBook.count(),
            (prisma as any).exchange.count(),
            (prisma as any).exchange.count({ where: { status: 'PENDING' } }),
            (prisma as any).exchange.count({ where: { status: 'ACCEPTED' } }),
            (prisma as any).exchange.count({ where: { status: 'REJECTED' } }),
            (prisma as any).exchange.count({ where: { status: 'COMPLETED' } }),
            (prisma as any).rating.count(),
            (prisma as any).message.count()
        ])

        // Top rated users
        const topRatedUsers = await (prisma as any).user.findMany({
            take: 5,
            orderBy: { rating: 'desc' },
            where: {
                rating: { gt: 0 },
                role: 'USER' as any
            },
            select: { id: true, fullName: true, image: true, rating: true, city: true }
        })

        // Échanges récents
        const recentExchanges = await (prisma as any).exchange.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                requester: { select: { fullName: true, email: true, image: true } },
                responder: { select: { fullName: true, email: true, image: true } },
                bookRequested: { select: { title: true } }
            }
        })

        // Livres récents
        const recentBooks = await (prisma as any).exchangeBook.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                owner: { select: { fullName: true, email: true } }
            }
        })

        // Exchanges par jour (7 derniers jours)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const dailyExchanges = await (prisma as any).exchange.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: sevenDaysAgo }
            },
            _count: { id: true }
        })

        // Formater les données pour le chart
        const exchangeChartData = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

            const count = (dailyExchanges as any[]).filter((e: any) =>
                new Date(e.createdAt).toDateString() === date.toDateString()
            ).reduce((acc: number, curr: any) => acc + curr._count.id, 0)

            return { name: dateStr, value: count }
        })

        return {
            totalUsers,
            totalBooks,
            totalExchanges,
            pendingExchanges,
            acceptedExchanges,
            rejectedExchanges,
            totalRatings,
            totalMessages,
            completedExchanges,
            topRatedUsers,
            recentExchanges,
            recentBooks,
            exchangeChartData
        }
    } catch (error) {
        return null
    }
}

// Liste de tous les échanges avec filtres
export async function getAllExchanges(filters?: {
    status?: string
    search?: string
    page?: number
}) {
    try {
        await verifyAdmin()

        const page = filters?.page || 1
        const perPage = 20
        const skip = (page - 1) * perPage

        const where: any = {}

        if (filters?.status && filters.status !== 'ALL') {
            where.status = filters.status
        }

        const [exchanges, total] = await Promise.all([
            (prisma as any).exchange.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    requester: { select: { id: true, fullName: true, email: true, image: true } },
                    responder: { select: { id: true, fullName: true, email: true, image: true } },
                    bookRequested: { select: { title: true, author: true, image: true } },
                    bookOffered: { select: { title: true, author: true, image: true } },
                    rating: true
                }
            }),
            (prisma as any).exchange.count({ where })
        ])

        return {
            exchanges,
            total,
            pages: Math.ceil(total / perPage),
            currentPage: page
        }
    } catch (error) {
        return null
    }
}

// Liste de tous les utilisateurs
export async function getAllUsers(page = 1) {
    try {
        await verifyAdmin()

        const perPage = 20
        const skip = (page - 1) * perPage

        const [users, total] = await Promise.all([
            (prisma as any).user.findMany({
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    city: true,
                    rating: true,
                    credits: true,
                    image: true,
                    isBanned: true,
                    createdAt: true,
                    _count: {
                        select: {
                            ownedBooks: true,
                            sentExchanges: true,
                            receivedExchanges: true
                        }
                    }
                }
            }),
            (prisma as any).user.count()
        ])

        return {
            users,
            total,
            pages: Math.ceil(total / perPage),
            currentPage: page
        }
    } catch (error) {
        return null
    }
}

// Liste de tous les livres
export async function getAllBooks(filters?: {
    status?: string
    search?: string
    page?: number
}) {
    try {
        await verifyAdmin()

        const page = filters?.page || 1
        const perPage = 20
        const skip = (page - 1) * perPage

        const where: any = {}

        if (filters?.status && filters.status !== 'ALL') {
            where.status = filters.status
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search } },
                { author: { contains: filters.search } }
            ]
        }

        const [books, total] = await Promise.all([
            (prisma as any).exchangeBook.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: { select: { fullName: true, email: true } }
                }
            }),
            (prisma as any).exchangeBook.count({ where })
        ])

        return {
            books,
            total,
            pages: Math.ceil(total / perPage),
            currentPage: page
        }
    } catch (error) {
        return null
    }
}

// Supprimer un échange
export async function deleteExchange(exchangeId: string) {
    try {
        await verifyAdmin()

        await (prisma as any).exchange.delete({
            where: { id: exchangeId }
        })

        revalidatePath('/admin/exchanges')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la suppression" }
    }
}

// Supprimer un livre
export async function deleteBook(bookId: string) {
    try {
        await verifyAdmin()

        await (prisma as any).exchangeBook.delete({
            where: { id: bookId }
        })

        revalidatePath('/admin/books')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la suppression" }
    }
}

// Bannir/Débannir un utilisateur
export async function toggleUserStatus(userId: string) {
    try {
        await verifyAdmin()

        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            select: { isBanned: true }
        })

        if (!user) return { success: false, error: "Utilisateur non trouvé" }

        await (prisma as any).user.update({
            where: { id: userId },
            data: { isBanned: !user.isBanned }
        })

        if (!user.isBanned) {
            // Devient banni (false -> true)
            await (prisma as any).exchangeBook.updateMany({
                where: { ownerId: userId, status: 'AVAILABLE' },
                data: { status: 'HIDDEN' }
            })
        } else {
            // Devient débanni (true -> false)
            await (prisma as any).exchangeBook.updateMany({
                where: { ownerId: userId, status: 'HIDDEN' },
                data: { status: 'AVAILABLE' }
            })
        }

        revalidatePath('/admin/community/users')
        return { success: true, isBanned: !user.isBanned }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur" }
    }
}
