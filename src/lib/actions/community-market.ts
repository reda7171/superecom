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
        const books = await (prisma as any).exchangeBook.findMany({
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
        const book = await (prisma as any).exchangeBook.findUnique({
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
        const books = await (prisma as any).exchangeBook.findMany({
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
// Smart matching logic: Find users who have what I want AND want what I have
export async function getSmartMatches() {
    const user = await getCommunityUser()
    if (!user) return []

    try {
        // 1. Ma wishlist
        const myWishlist = await (prisma as any).wishlist.findMany({
            where: { userId: user.id }
        })
        const wishlistTitles = myWishlist.map((w: any) => w.title.toLowerCase())

        // 2. Mes livres
        const myBooks = await (prisma as any).exchangeBook.findMany({
            where: { ownerId: user.id, status: 'AVAILABLE' }
        })
        const myTitles = myBooks.map((b: any) => b.title.toLowerCase())

        if (wishlistTitles.length === 0) return []

        // 3. Trouver des livres qui matchent ma wishlist
        const matchingBooks = await (prisma as any).exchangeBook.findMany({
            where: {
                status: 'AVAILABLE',
                ownerId: { not: user.id },
                OR: wishlistTitles.map((title: string) => ({
                    title: { contains: title }
                }))
            },
            include: {
                owner: {
                    include: {
                        wishlist: true
                    }
                }
            },
            take: 20
        })

        // 4. Filtrer pour ne garder que ceux où le propriétaire veut un de mes livres
        const smartMatches = matchingBooks.filter((book: any) => {
            const ownerWishlist = (book.owner as any).wishlist || []
            return ownerWishlist.some((w: any) =>
                myTitles.some((myTitle: any) => myTitle.includes(w.title.toLowerCase()) || w.title.toLowerCase().includes(myTitle))
            )
        })

        return smartMatches
    } catch (error) {
        console.error('Error fetching smart matches:', error)
        return []
    }
}
