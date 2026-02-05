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
