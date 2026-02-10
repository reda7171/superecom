import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import Fuse from 'fuse.js'

// Types pour les filtres
export interface BookFilters {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    active?: boolean
    language?: string
}

/**
 * Récupère tous les livres avec filtres optionnels
 */
export async function getBooks(filters?: BookFilters) {
    const where: Prisma.BookWhereInput = {
        active: filters?.active ?? true,
    }

    // Filtre par catégorie
    if (filters?.category) {
        where.category = filters.category
    }

    // Filtre par langue
    if (filters?.language && filters.language !== 'all') {
        where.language = filters.language
    }

    // Filtre par prix
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        where.price = {}
        if (filters.minPrice !== undefined) {
            where.price.gte = filters.minPrice
        }
        if (filters.maxPrice !== undefined) {
            where.price.lte = filters.maxPrice
        }
    }

    // Récupération des livres
    let books = await prisma.book.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
    })

    // Recherche fuzzy par titre ou auteur si nécessaire
    if (filters?.search) {
        const fuseOptions = {
            keys: [
                { name: 'title', weight: 1.0 },
                { name: 'author', weight: 0.8 }
            ],
            threshold: 0.4,
            distance: 100,
            ignoreLocation: true
        }
        const fuse = new Fuse(books, fuseOptions)
        books = fuse.search(filters.search).map(res => res.item)
    }

    return books
}

/**
 * Récupère un livre par son ID
 */
export async function getBookById(id: string) {
    return prisma.book.findUnique({
        where: { id },
    })
}

/**
 * Récupère les catégories uniques de livres
 */
export async function getBookCategories() {
    const books = await prisma.book.findMany({
        where: { active: true },
        select: { category: true },
        distinct: ['category'],
    })

    return books
        .map((b: { category: string | null }) => b.category)
        .filter((c: string | null): c is string => c !== null)
        .sort()
}

/**
 * Récupère les livres populaires (les plus en stock)
 */
export async function getPopularBooks(limit = 6) {
    return prisma.book.findMany({
        where: { active: true },
        orderBy: { stock: 'desc' },
        take: limit,
    })
}

/**
 * Vérifie la disponibilité d'un livre
 */
export async function checkBookAvailability(bookId: string, quantity: number) {
    const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { stock: true, active: true },
    })

    if (!book || !book.active) {
        return { available: false, reason: 'Livre non disponible' }
    }

    if (book.stock < quantity) {
        return { available: false, reason: 'Stock insuffisant' }
    }

    return { available: true }
}

/**
 * Récupère les livres best-sellers (les plus vendus)
 */
export async function getBestSellerBooks(limit = 6) {
    // Récupérer les livres les plus vendus via OrderItem
    const topBooks = await prisma.orderItem.groupBy({
        by: ['bookId'],
        where: {
            type: 'BOOK',
            bookId: { not: null }
        },
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: limit
    })

    // Récupérer les détails des livres
    const booksWithDetails = await Promise.all(
        topBooks.map(async (item) => {
            const book = await prisma.book.findUnique({
                where: { id: item.bookId! }
            })
            return book
        })
    )

    // Filtrer les null et retourner
    return booksWithDetails.filter((book): book is NonNullable<typeof book> => book !== null && book.active)
}

/**
 * Récupère les meilleurs auteurs (les plus vendus)
 */
export async function getBestAuthors(limit = 6) {
    // Récupérer tous les livres vendus avec leurs quantités
    const soldBooks = await prisma.orderItem.groupBy({
        by: ['bookId'],
        where: {
            type: 'BOOK',
            bookId: { not: null }
        },
        _sum: {
            quantity: true
        }
    })

    // Récupérer les détails des livres
    const booksWithSales = await Promise.all(
        soldBooks.map(async (item) => {
            const book = await prisma.book.findUnique({
                where: { id: item.bookId! },
                select: { author: true, image: true }
            })
            return {
                author: book?.author,
                image: book?.image,
                totalSold: item._sum.quantity || 0
            }
        })
    )

    // Grouper par auteur et calculer le total des ventes
    const authorStats = booksWithSales.reduce((acc: any[], curr) => {
        if (!curr.author) return acc

        const existing = acc.find(a => a.author === curr.author)
        if (existing) {
            existing.totalSold += curr.totalSold
            existing.bookCount += 1
        } else {
            acc.push({
                author: curr.author,
                totalSold: curr.totalSold,
                bookCount: 1,
                image: curr.image
            })
        }
        return acc
    }, [])

    // Trier par total de ventes et limiter
    const topAuthors = authorStats
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit)

    // Récupérer un livre exemple pour chaque auteur
    const authorsWithBooks = await Promise.all(
        topAuthors.map(async (author) => {
            const book = await prisma.book.findFirst({
                where: {
                    author: author.author,
                    active: true
                }
            })
            return {
                ...author,
                sampleBook: book
            }
        })
    )

    return authorsWithBooks.filter(a => a.sampleBook !== null)
}
