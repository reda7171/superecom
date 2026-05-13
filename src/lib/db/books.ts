import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import Fuse from 'fuse.js'
import { getCached, generateCacheKey } from '@/lib/cache'

// Types pour les filtres
export interface BookFilters {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    active?: boolean
    includeInactive?: boolean
    language?: string
    author?: string
    inStock?: boolean
    page?: number
    limit?: number
}

/**
 * Récupère tous les livres avec filtres optionnels
 */
export async function getBooks(filters?: BookFilters) {
    try {
        const page = filters?.page || 1
        const limit = filters?.limit || 12
        const skip = (page - 1) * limit

        const where: Prisma.BookWhereInput = {}

        if (filters?.active !== undefined) {
            where.active = filters.active
        } else if (!filters?.includeInactive) {
            where.active = true
        }

        // Filtre par catégorie
        if (filters?.category) {
            where.category = filters.category
        }

        // Filtre par langue
        if (filters?.language && filters.language !== 'all') {
            where.language = filters.language
        }

        // Filtre par auteur
        if (filters?.author) {
            where.author = filters.author
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

        // Filtre en stock
        if (filters?.inStock) {
            where.stock = { gt: 0 }
        }

        // Si recherche fuzzy, on doit tout récupérer pour trier
        if (filters?.search) {
            let books = await prisma.book.findMany({
                where,
                orderBy: [
                    { displayOrder: 'asc' },
                    { createdAt: 'desc' }
                ],
            })

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
            let results = fuse.search(filters.search).map(res => res.item)
            
            // Mettre les livres en rupture à la fin
            const inStock = results.filter(b => b.stock > 0)
            const outOfStock = results.filter(b => b.stock === 0)
            results = [...inStock, ...outOfStock]

            // Pagination manuelle après recherche
            return results.slice(skip, skip + limit)
        }

        // Pagination complexe pour mettre les "stock == 0" à la fin tout en gardant displayOrder
        const inStockWhere = { ...where, stock: { gt: 0 } }
        const outOfStockWhere = { ...where, stock: 0 }

        const inStockCount = await prisma.book.count({ where: inStockWhere })

        let books: any[] = []

        if (skip < inStockCount) {
            // On a besoin de livres en stock
            const inStockBooks = await prisma.book.findMany({
                where: inStockWhere,
                orderBy: [
                    { displayOrder: 'asc' },
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit,
            })
            books = [...inStockBooks]

            // S'il reste de la place sur la page, on complète avec des ruptures de stock
            if (books.length < limit) {
                const remainingLimit = limit - books.length
                const outOfStockBooks = await prisma.book.findMany({
                    where: outOfStockWhere,
                    orderBy: [
                        { displayOrder: 'asc' },
                        { createdAt: 'desc' }
                    ],
                    skip: 0,
                    take: remainingLimit,
                })
                books = [...books, ...outOfStockBooks]
            }
        } else {
            // On ne prend que des livres en rupture
            const outOfStockSkip = skip - inStockCount
            books = await prisma.book.findMany({
                where: outOfStockWhere,
                orderBy: [
                    { displayOrder: 'asc' },
                    { createdAt: 'desc' }
                ],
                skip: outOfStockSkip,
                take: limit,
            })
        }

        return books
    } catch (e) {
        console.error('Erreur getBooks (non bloquant) :', e)
        return []
    }
}

/**
 * Compte le nombre total de livres correspondant aux filtres
 */
export async function getBooksCount(filters?: BookFilters) {
    try {
        const where: Prisma.BookWhereInput = {}

        if (filters?.active !== undefined) {
            where.active = filters.active
        } else if (!filters?.includeInactive) {
            where.active = true
        }

        if (filters?.category) {
            where.category = filters.category
        }

        if (filters?.language && filters.language !== 'all') {
            where.language = filters.language
        }

        if (filters?.author) {
            where.author = filters.author
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {}
            if (filters.minPrice !== undefined) {
                where.price.gte = filters.minPrice
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = filters.maxPrice
            }
        }

        if (filters?.inStock) {
            where.stock = { gt: 0 }
        }

        if (filters?.search) {
            // Pour Fuse.js, on doit appliquer le filtre puis filtrer manuellement
            const books = await prisma.book.findMany({
                where,
                select: { id: true, title: true, author: true }
            })

            const fuseOptions = {
                keys: ['title', 'author'],
                threshold: 0.4
            }
            const fuse = new Fuse(books, fuseOptions)
            return fuse.search(filters.search).length
        }

        return await prisma.book.count({ where })
    } catch (e) {
        console.error('Erreur getBooksCount (non bloquant) :', e)
        return 0
    }
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
 * Récupère les catégories uniques de livres (avec cache)
 */
export async function getBookCategories() {
    return getCached(
        'book:categories',
        async () => {
            const books = await prisma.book.findMany({
                where: { active: true },
                select: { category: true },
                distinct: ['category'],
            })

            return books
                .map((b: { category: string | null }) => b.category)
                .filter((c: string | null): c is string => c !== null)
                .sort()
        },
        600 // Cache 10 minutes
    )
}

/**
 * Récupère tous les auteurs uniques de livres (avec cache)
 */
export async function getAllAuthors() {
    return getCached(
        'book:authors:all',
        async () => {
            const authors = await prisma.book.findMany({
                where: { active: true },
                select: { author: true },
                distinct: ['author'],
            })

            return authors
                .map((b: { author: string }) => b.author)
                .filter((a: string) => a && a.trim() !== '')
                .sort()
        },
        600 // Cache 10 minutes
    )
}

/**
 * Récupère les livres populaires (avec cache)
 */
export async function getPopularBooks(limit = 6) {
    return getCached(
        `book:popular:${limit}`,
        async () => {
            return prisma.book.findMany({
                where: { active: true },
                orderBy: { stock: 'desc' },
                take: limit,
            })
        },
        300 // Cache 5 minutes
    )
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
    // 1. Récupérer les livres les plus vendus via OrderItem
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

    // 2. Si on a des ventes, on récupère ces livres
    if (topBooks.length > 0) {
        const booksWithDetails = await Promise.all(
            topBooks.map(async (item) => {
                const book = await prisma.book.findUnique({
                    where: { id: item.bookId! }
                })
                return book
            })
        )
        return booksWithDetails.filter((book): book is NonNullable<typeof book> => book !== null && book.active)
    }

    // 3. Fallback : On affiche les livres marqués manuellement comme "Meilleure Vente"
    // S'il n'y en a pas assez, on complète avec les livres ayant le plus de stock
    const manuallySelected = await prisma.book.findMany({
        where: { active: true, isBestSeller: true },
        take: limit,
    })

    if (manuallySelected.length >= limit) {
        return manuallySelected
    }

    const others = await prisma.book.findMany({
        where: { 
            active: true, 
            id: { notIn: manuallySelected.map(b => b.id) } 
        },
        orderBy: { stock: 'desc' },
        take: limit - manuallySelected.length,
    })

    return [...manuallySelected, ...others]
}

/**
 * Récupère les meilleurs auteurs (les plus vendus OU les plus présents dans le catalogue)
 */
export async function getBestAuthors(limit = 6) {
    return getCached(
        `book:best-authors:${limit}`,
        async () => {
            // 1. Tenter de récupérer les auteurs par ventes (OrderItem)
            const soldBooks = await prisma.orderItem.groupBy({
                by: ['bookId'],
                where: { 
                    type: 'BOOK',
                    bookId: { not: null }
                },
                _sum: { quantity: true }
            })

            let topAuthorsRaw = []

            if (soldBooks.length > 0) {
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

                topAuthorsRaw = authorStats.sort((a, b) => b.totalSold - a.totalSold).slice(0, limit)
            }

            if (topAuthorsRaw.length < limit) {
                const existingAuthorNames = topAuthorsRaw.map((a: any) => a.author)
                
                const catalogAuthors = await prisma.book.groupBy({
                    by: ['author'],
                    where: { 
                        active: true,
                        ...(existingAuthorNames.length > 0 ? { author: { notIn: existingAuthorNames } } : {})
                    },
                    _count: { _all: true },
                    orderBy: { _count: { author: 'desc' } },
                    take: limit - topAuthorsRaw.length
                })

                const additionalAuthors = catalogAuthors.map(a => ({
                    author: a.author,
                    totalSold: 0,
                    bookCount: a._count._all
                }))

                topAuthorsRaw = [...topAuthorsRaw, ...additionalAuthors]
            }

            const finalAuthors = await Promise.all(
                topAuthorsRaw.map(async (author) => {
                    // Chercher d'abord si un AuthorProfile existe
                    const profile = await prisma.authorProfile.findUnique({
                        where: { name: author.author }
                    })

                    const book = await prisma.book.findFirst({
                        where: { author: author.author, active: true },
                        orderBy: { stock: 'desc' }
                    })

                    return {
                        ...author,
                        image: profile?.image || author.image || book?.image,
                        sampleBook: book,
                        bio: profile?.bio
                    }
                })
            )

            return finalAuthors.filter(a => a.sampleBook !== null)
        },
        600 // Cache 10 minutes
    )
}
