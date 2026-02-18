/**
 * Optimisation des requêtes Prisma
 */

import { Prisma } from '@prisma/client'

/**
 * Sélections optimisées pour réduire la taille des données
 */

// Sélection minimale pour les listes de livres
export const bookListSelect = {
    id: true,
    title: true,
    author: true,
    price: true,
    image: true,
    stock: true,
    category: true,
    active: true,
} satisfies Prisma.BookSelect

// Sélection pour les cartes de packs
export const packCardSelect = {
    id: true,
    name: true,
    price: true,
    image: true,
    description: true,
    books: {
        select: {
            book: {
                select: {
                    id: true,
                    title: true,
                    image: true,
                }
            }
        },
        take: 3 // Limiter pour les previews
    }
} satisfies Prisma.PackSelect

// Sélection pour les commandes (admin)
export const orderListSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    city: true,
    total: true,
    status: true,
    createdAt: true,
    trackingID: true,
    deliveryStatus: true,
} satisfies Prisma.OrderSelect

// Sélection détaillée pour une commande
export const orderDetailSelect = {
    ...orderListSelect,
    address: true,
    comment: true,
    subtotal: true,
    shippingFees: true,
    couponCode: true,
    paymentMethod: true,
    items: {
        select: {
            id: true,
            type: true,
            quantity: true,
            price: true,
            book: {
                select: {
                    id: true,
                    title: true,
                    image: true,
                    author: true,
                }
            },
            pack: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    },
    statusHistory: {
        select: {
            id: true,
            status: true,
            comment: true,
            createdAt: true,
            createdBy: true,
        },
        orderBy: {
            createdAt: 'desc' as const
        }
    }
} satisfies Prisma.OrderSelect

/**
 * Indexes recommandés pour Prisma
 * À ajouter dans schema.prisma
 */
export const RECOMMENDED_INDEXES = `
// Dans schema.prisma

model Book {
  // ... existing fields
  
  @@index([active, stock])
  @@index([category, active])
  @@index([price, active])
  @@index([createdAt])
}

model Order {
  // ... existing fields
  
  @@index([email])
  @@index([status, createdAt])
  @@index([trackingID])
  @@index([createdAt])
}

model OrderItem {
  // ... existing fields
  
  @@index([bookId, type])
  @@index([packId, type])
}

model Exchange {
  // ... existing fields
  
  @@index([status, createdAt])
  @@index([requesterId])
  @@index([responderId])
}

model User {
  // ... existing fields
  
  @@index([email])
  @@index([role])
}
`

/**
 * Query helpers optimisés
 */

// Pagination helper
export function getPaginationParams(page: number = 1, limit: number = 12) {
    return {
        skip: (page - 1) * limit,
        take: limit,
    }
}

// Recherche optimisée avec full-text search (si disponible)
export function getSearchWhere(search: string): Prisma.BookWhereInput {
    return {
        OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { author: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
        ]
    }
}

// Filtres combinés optimisés
export function buildBookFilters(filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    language?: string
    active?: boolean
}): Prisma.BookWhereInput {
    const where: Prisma.BookWhereInput = {}

    if (filters.active !== undefined) {
        where.active = filters.active
    }

    if (filters.category) {
        where.category = filters.category
    }

    if (filters.language && filters.language !== 'all') {
        where.language = filters.language
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {}
        if (filters.minPrice !== undefined) {
            where.price.gte = filters.minPrice
        }
        if (filters.maxPrice !== undefined) {
            where.price.lte = filters.maxPrice
        }
    }

    return where
}
