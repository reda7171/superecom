'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schéma de validation pour un item de commande
const OrderItemSchema = z.object({
    type: z.enum(['BOOK', 'PACK']),
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
})

// Schéma de validation pour une commande
const CreateOrderSchema = z.object({
    fullName: z.string().min(3, 'Le nom complet doit contenir au moins 3 caractères'),
    phone: z.string().regex(/^0[5-7]\d{8}$/, 'Numéro de téléphone invalide'),
    address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères'),
    city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
    comment: z.string().optional(),
    couponCode: z.string().optional().nullable(),
    items: z.array(OrderItemSchema).min(1, 'La commande doit contenir au moins un article'),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

export type OrderResult =
    | { success: true; orderId: string }
    | { success: false; error: string }

/**
 * Server Action pour créer une commande avec transaction
 * Gère la création de la commande, des items et la décrémentation du stock
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
    try {
        // Validation des données
        const validatedData = CreateOrderSchema.parse(input)

        const subtotal = validatedData.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        )

        let total = subtotal
        let discountAmount = 0

        if (validatedData.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: validatedData.couponCode.toUpperCase(), isActive: true }
            })

            if (coupon) {
                if (coupon.type === 'PERCENTAGE') {
                    discountAmount = (subtotal * coupon.discount) / 100
                } else {
                    discountAmount = coupon.discount
                }
                total = Math.max(0, subtotal - discountAmount)
            }
        }

        // Transaction Prisma pour garantir la cohérence
        const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Vérifier la disponibilité et collecter les mises à jour de stock
            const stockUpdates: Array<{ id: string; quantity: number }> = []

            for (const item of validatedData.items) {
                if (item.type === 'BOOK') {
                    const book = await tx.book.findUnique({
                        where: { id: item.productId },
                        select: { stock: true, active: true },
                    })

                    if (!book || !book.active) {
                        throw new Error('Un livre de la commande n\'est plus disponible')
                    }

                    if (book.stock < item.quantity) {
                        throw new Error('Stock insuffisant pour un livre de la commande')
                    }

                    stockUpdates.push({ id: item.productId, quantity: item.quantity })
                } else if (item.type === 'PACK') {
                    const pack = await tx.pack.findUnique({
                        where: { id: item.productId },
                        include: {
                            books: {
                                include: {
                                    book: {
                                        select: { id: true, stock: true, active: true },
                                    },
                                },
                            },
                        },
                    })

                    if (!pack || !pack.active) {
                        throw new Error('Un pack de la commande n\'est plus disponible')
                    }

                    // Vérifier le stock de chaque livre du pack
                    for (const packBook of pack.books) {
                        if (!packBook.book.active) {
                            throw new Error('Un livre du pack n\'est plus disponible')
                        }

                        if (packBook.book.stock < item.quantity) {
                            throw new Error('Stock insuffisant pour un livre du pack')
                        }

                        stockUpdates.push({
                            id: packBook.book.id,
                            quantity: item.quantity,
                        })
                    }
                }
            }

            // 2. Créer la commande avec ses items
            const createdOrder = await tx.order.create({
                data: {
                    fullName: validatedData.fullName,
                    phone: validatedData.phone,
                    address: validatedData.address,
                    city: validatedData.city,
                    comment: validatedData.comment,
                    total: total,
                    discount: discountAmount,
                    couponCode: validatedData.couponCode,
                    status: 'PENDING',
                    items: {
                        create: validatedData.items.map((item) => ({
                            type: item.type,
                            quantity: item.quantity,
                            price: item.price,
                            bookId: item.type === 'BOOK' ? item.productId : null,
                            packId: item.type === 'PACK' ? item.productId : null,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            })

            // 3. Décrémenter le stock des livres
            for (const update of stockUpdates) {
                await tx.book.update({
                    where: { id: update.id },
                    data: {
                        stock: {
                            decrement: update.quantity,
                        },
                    },
                })
            }

            return createdOrder
        })

        // Revalider les pages concernées
        revalidatePath('/') // Page d'accueil
        revalidatePath('/books') // Catalogue
        revalidatePath('/packs') // Packs

        return {
            success: true,
            orderId: order.id,
        }
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            }
        }

        return {
            success: false,
            error: 'Une erreur est survenue lors de la création de la commande',
        }
    }
}

/**
 * Server Action pour récupérer une commande par ID
 */
export async function getOrderById(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                title: true,
                                author: true,
                                image: true,
                            },
                        },
                        pack: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        })

        return order
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error)
        return null
    }
}

/**
 * Server Action pour mettre à jour le statut d'une commande (Admin)
 */
export async function updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
): Promise<OrderResult> {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status },
        })

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)

        return {
            success: true,
            orderId,
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error)
        return {
            success: false,
            error: 'Impossible de mettre à jour le statut de la commande',
        }
    }
}
