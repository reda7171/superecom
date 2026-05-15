'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getCommunityUser } from './community-auth'
import { verifyAdmin, isAuthenticated } from './auth'
import { z } from 'zod'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/security'

const OrderSchema = z.object({
    fullName: z.string().min(1, 'Nom complet requis').max(100),
    email: z.string().optional().default(''),
    phone: z.string().min(8, 'Téléphone invalide').max(20),
    address: z.string().min(5, 'Adresse trop courte').max(500),
    city: z.string().min(1, 'Ville requise').max(100),
    comment: z.string().max(1000).optional(),
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive('La quantité doit être supérieure à 0').max(100),
        type: z.enum(['BOOK', 'PACK', 'GIFT', 'DIGITAL']),
        price: z.number().min(0, 'Le prix doit être positif ou nul').max(100000)
    })).min(1, 'Panier vide').max(50),
    couponCode: z.string().max(50).optional(),
    discount: z.number().optional()
})

export async function getOrders() {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('userEmail')?.value
    const user = await getCommunityUser()

    const emailToUse = user ? user.email : userEmail

    if (!emailToUse) {
        return null
    }

    try {
        const orders = await (prisma.order as any).findMany({
            where: {
                email: emailToUse
            },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                image: true,
                            }
                        },
                        pack: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        digitalProduct: {
                            select: {
                                id: true,
                                title: true,
                                image: true,
                                pdfUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return orders as any[]
    } catch (error) {
        return []
    }
}

export async function createOrder(input: z.infer<typeof OrderSchema>) {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`order_${ip}`, { limit: 10, windowMs: 60000 }) // 3 commandes par minute max

    if (!limiter.success) {
        return { success: false, error: "Trop de commandes. Veuillez patienter une minute." }
    }

    try {

        // OWASP A03: Injection / Validation
        const data = OrderSchema.parse(input)

        // OWASP A03: Sanitize inputs to prevent XSS
        const sanitizedData = {
            ...data,
            fullName: sanitizeInput(data.fullName),
            address: sanitizeInput(data.address),
            city: sanitizeInput(data.city),
            comment: data.comment ? sanitizeInput(data.comment) : undefined,
        }

        // Calcul du total côté serveur pour sécurité
        let subtotal = sanitizedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        // Appliquer la réduction si elle est fournie par le client (après validation)
        let discount = sanitizedData.discount || 0

        // Logique de livraison synchronisée avec le client: Gratuit si > 500 MAD (avant réduction)
        let shippingFees = subtotal >= 500 ? 0 : 30
        let total = Math.max(0, subtotal - discount + shippingFees)

        // Création commande transactionnelle
        const order = await prisma.$transaction(async (tx) => {
            // Récupérer les prix de revient (costPrice) pour chaque article
            const itemsWithCost = await Promise.all(data.items.map(async (item) => {
                let costPrice = 0
                if (item.type === 'BOOK') {
                    const book = await tx.book.findUnique({
                        where: { id: item.productId },
                        select: { costPrice: true }
                    })
                    costPrice = book?.costPrice || 0
                } else if (item.type === 'PACK') {
                    const pack = await tx.pack.findUnique({
                        where: { id: item.productId },
                        select: { costPrice: true }
                    })
                    costPrice = pack?.costPrice || 0
                }
                return { ...item, costPrice }
            }))

            // Créer la commande
            const newOrder = await (tx.order as any).create({
                data: {
                    fullName: sanitizedData.fullName,
                    email: sanitizedData.email,
                    phone: sanitizedData.phone,
                    address: sanitizedData.address,
                    city: sanitizedData.city,
                    comment: sanitizedData.comment,
                    subtotal: subtotal,
                    shippingFees: shippingFees,
                    discount: discount,
                    total: total,
                    couponCode: data.couponCode,
                    status: 'PENDING',
                    paymentMethod: sanitizedData.items.every(item => item.type === 'DIGITAL')
                        ? 'DIGITAL_PAYMENT'
                        : 'COD', // Cash On Delivery
                    items: {
                        create: itemsWithCost.map(item => ({
                            type: item.type,
                            bookId: item.type === 'BOOK' ? item.productId : null,
                            packId: item.type === 'PACK' ? item.productId : null,
                            giftId: item.type === 'GIFT' ? item.productId : null,
                            digitalProductId: item.type === 'DIGITAL' ? item.productId : null,
                            quantity: item.quantity,
                            price: item.price,
                            costPrice: item.costPrice
                        }))
                    }
                }
            })

            // Mettre à jour le stock des livres
            for (const item of data.items) {
                if (item.type === 'BOOK') {
                    const updatedBook = await tx.book.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    })
                    
                    if (updatedBook.stock < 3) {
                        const { sendLowStockNotification } = await import('@/lib/telegram')
                        sendLowStockNotification({ 
                            id: updatedBook.id,
                            title: updatedBook.title, 
                            stock: updatedBook.stock 
                        }).catch(console.error)
                    }
                }
            }

            return newOrder
        })

        // Sauvegarder l'email dans un cookie pour le suivi invité
        const cookieStore = await cookies()
        if (!cookieStore.get('userEmail')) {
            cookieStore.set('userEmail', data.email, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 jours 
            })
        }

        // Notification Telegram (asynchrone, on ne bloque pas la réponse)
        try {
            const fullOrder = await getOrderById(order.id)
            if (fullOrder) {
                const { sendOrderNotification } = await import('@/lib/telegram')
                sendOrderNotification(fullOrder as any).catch(console.error)
            }
        } catch (e) {
            console.error('Erreur Telegram Notification:', e)
        }

        return { success: true, orderId: order.id }

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        console.error('Erreur createOrder:', error)
        return { success: false, error: "Une erreur est survenue lors de la commande." }
    }
}

// ... existing code ...

export async function getOrderById(orderId: string) {
    try {
        const order = await (prisma.order as any).findUnique({
            where: {
                id: orderId
            },
            include: {
                items: {
                    include: {
                        book: true,
                        pack: true
                    }
                }
            }
        })

        if (!order) return null

        // OWASP A01: Broken Access Control
        // Seul l'admin ou le propriétaire de la commande peut voir les détails
        const isAdmin = await isAuthenticated()
        if (!isAdmin) {
            const cookieStore = await cookies()
            const guestEmail = cookieStore.get('userEmail')?.value
            const communityUser = await getCommunityUser()
            const emailToCheck = communityUser?.email || guestEmail

            if (order.email !== emailToCheck) {

                return null
            }
        }

        return order
    } catch (error) {
        console.error('Error fetching order:', error)
        return null
    }
}

export async function getOrderStats() {
    try {
        await verifyAdmin() // OWASP A01: Broken Access Control

        const stats = await prisma.order.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        })

        const counts = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id
            return acc
        }, {} as Record<string, number>)

        return {
            PENDING: counts.PENDING || 0,
            CONFIRMED: counts.CONFIRMED || 0,
            SHIPPED: counts.SHIPPED || 0,
            DELIVERED: counts.DELIVERED || 0,
            CANCELLED: counts.CANCELLED || 0
        }
    } catch (error: any) {
        if (error?.message && !error.message.includes('Non autorisé')) {
            console.error('Error fetching order stats:', error)
        }
        return null
    }
}
