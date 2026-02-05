import { prisma } from '@/lib/prisma'

/**
 * Récupère tous les packs actifs avec leurs livres
 */
export async function getPacks() {
    return prisma.pack.findMany({
        where: { active: true },
        include: {
            books: {
                include: {
                    book: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

/**
 * Récupère un pack par son ID avec ses livres
 */
export async function getPackById(id: string) {
    return prisma.pack.findUnique({
        where: { id },
        include: {
            books: {
                include: {
                    book: true,
                },
            },
        },
    })
}

/**
 * Récupère les packs populaires
 */
export async function getPopularPacks(limit = 3) {
    return prisma.pack.findMany({
        where: { active: true },
        include: {
            books: {
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            author: true,
                            price: true,
                            image: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    })
}

/**
 * Vérifie la disponibilité d'un pack
 */
export async function checkPackAvailability(packId: string, quantity: number) {
    const pack = await prisma.pack.findUnique({
        where: { id: packId },
        include: {
            books: {
                include: {
                    book: {
                        select: {
                            stock: true,
                            active: true,
                        },
                    },
                },
            },
        },
    })

    if (!pack || !pack.active) {
        return { available: false, reason: 'Pack non disponible' }
    }

    // Vérifier que tous les livres du pack sont disponibles
    for (const packBook of pack.books) {
        if (!packBook.book.active) {
            return { available: false, reason: 'Un livre du pack n\'est plus disponible' }
        }
        if (packBook.book.stock < quantity) {
            return { available: false, reason: 'Stock insuffisant pour un livre du pack' }
        }
    }

    return { available: true }
}
