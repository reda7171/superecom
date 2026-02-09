'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'

// Vérifier si l'utilisateur est admin
async function isAdmin() {
    const user = await getCommunityUser()
    if (!user || user.role !== 'ADMIN') {
        return false
    }
    return true
}

// Statistiques du dashboard
export async function getAdminStats() {
    if (!await isAdmin()) return null

    try {
        const [
            totalUsers,
            totalBooks,
            totalExchanges,
            pendingExchanges,
            acceptedExchanges,
            rejectedExchanges,
            totalRatings,
            totalMessages
        ] = await Promise.all([
            prisma.user.count(),
            prisma.exchangeBook.count(),
            prisma.exchange.count(),
            prisma.exchange.count({ where: { status: 'PENDING' } }),
            prisma.exchange.count({ where: { status: 'ACCEPTED' } }),
            prisma.exchange.count({ where: { status: 'REJECTED' } }),
            prisma.rating.count(),
            prisma.message.count()
        ])

        // Échanges récents
        const recentExchanges = await prisma.exchange.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                requester: { select: { fullName: true, email: true } },
                responder: { select: { fullName: true, email: true } },
                bookRequested: { select: { title: true } }
            }
        })

        // Livres récents
        const recentBooks = await prisma.exchangeBook.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                owner: { select: { fullName: true, email: true } }
            }
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
            recentExchanges,
            recentBooks
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
    if (!await isAdmin()) return null

    const page = filters?.page || 1
    const perPage = 20
    const skip = (page - 1) * perPage

    try {
        const where: any = {}

        if (filters?.status && filters.status !== 'ALL') {
            where.status = filters.status
        }

        const [exchanges, total] = await Promise.all([
            prisma.exchange.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    requester: { select: { id: true, fullName: true, email: true, image: true } },
                    responder: { select: { id: true, fullName: true, email: true, image: true } },
                    bookRequested: { select: { title: true, author: true, image: true } },
                    bookOffered: { select: { title: true, author: true, image: true } }
                }
            }),
            prisma.exchange.count({ where })
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
    if (!await isAdmin()) return null

    const perPage = 20
    const skip = (page - 1) * perPage

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
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
            prisma.user.count()
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
    if (!await isAdmin()) return null

    const page = filters?.page || 1
    const perPage = 20
    const skip = (page - 1) * perPage

    try {
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
            prisma.exchangeBook.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: { select: { fullName: true, email: true } }
                }
            }),
            prisma.exchangeBook.count({ where })
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
    if (!await isAdmin()) return { success: false, error: "Non autorisé" }

    try {
        await prisma.exchange.delete({
            where: { id: exchangeId }
        })

        revalidatePath('/admin/exchanges')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" }
    }
}

// Supprimer un livre
export async function deleteBook(bookId: string) {
    if (!await isAdmin()) return { success: false, error: "Non autorisé" }

    try {
        await prisma.exchangeBook.delete({
            where: { id: bookId }
        })

        revalidatePath('/admin/books')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" }
    }
}

// Bannir un utilisateur (désactiver son compte)
export async function toggleUserStatus(userId: string) {
    if (!await isAdmin()) return { success: false, error: "Non autorisé" }

    try {
        // Pour l'instant, on peut juste supprimer tous ses livres disponibles
        await prisma.exchangeBook.updateMany({
            where: { ownerId: userId, status: 'AVAILABLE' },
            data: { status: 'EXCHANGED' } // Marquer comme échangé pour les cacher
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}
