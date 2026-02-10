'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'

export type MarketFilters = {
    search?: string
    city?: string
    condition?: string
}

export async function getMarketBooks(filters: MarketFilters = {}) {
    const user = await getCommunityUser()
    const currentUserId = user?.id

    const where: any = {
        status: 'AVAILABLE',
        // Exclude own books
        ownerId: currentUserId ? { not: currentUserId } : undefined,
    }

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search } }, // Case insensitive usually handled by DB collation or mode: 'insensitive' in Postgres
            { author: { contains: filters.search } },
        ]
    }

    if (filters.city) {
        where.owner = {
            city: { contains: filters.city }
        }
    }

    try {
        const books = await prisma.exchangeBook.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        city: true,
                        rating: true,
                        image: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        return books
    } catch (error) {
        return []
    }
}

export async function getExchangeBookDetails(bookId: string) {
    try {
        const book = await prisma.exchangeBook.findUnique({
            where: { id: bookId },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        city: true,
                        rating: true,
                        image: true,
                        createdAt: true, // Member since
                    }
                }
            }
        })
        return book
    } catch (error) {
        return null
    }
}

// Fonction pour récupérer les livres d'échange récents pour la page d'accueil
export async function getRecentExchangeBooks(limit = 6) {
    try {
        const books = await prisma.exchangeBook.findMany({
            where: {
                status: 'AVAILABLE',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        city: true,
                        rating: true,
                        image: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        })

        return books
    } catch (error) {
        return []
    }
}
