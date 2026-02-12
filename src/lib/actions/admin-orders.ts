'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/actions/auth'
import { createAuditLog } from './audit'
import { olivraison } from '@/lib/delivery/olivraison'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

/**
 * Mettre à jour le statut d'une commande
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
        await verifyAdmin()
        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)

        await createAuditLog({
            action: 'UPDATE_STATUS',
            entity: 'ORDER',
            entityId: orderId,
            details: `Statut de la commande mis à jour vers: ${status}`
        })

        return {
            success: true,
            message: 'Statut mis à jour avec succès'
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error)
        return {
            success: false,
            error: 'Impossible de mettre à jour le statut'
        }
    }
}

/**
 * Récupérer toutes les commandes (admin)
 */
export async function getAllOrders() {
    try {
        await verifyAdmin()
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                image: true,
                                price: true,
                            }
                        },
                        pack: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return orders
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error)
        return []
    }
}

/**
 * Récupérer une commande par son ID
 */
export async function getOrderById(orderId: string) {
    try {
        await verifyAdmin()
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                image: true,
                                price: true,
                            }
                        },
                        pack: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                            }
                        }
                    }
                }
            }
        })

        return order
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error)
        return null
    }
}

/**
 * Envoyer la commande à Olivraison
 */
export async function syncOrderToOlivraison(orderId: string) {
    try {
        await verifyAdmin()

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        })

        if (!order) throw new Error('Commande introuvable')
        if (order.trackingID) throw new Error('Cette commande a déjà un tracking ID')

        // Préparer les données pour Olivraison
        const packageData = {
            price: order.total,
            name: order.fullName,
            description: `Commande Riwaya #${order.id.slice(0, 8)}`,
            destination: {
                name: order.fullName,
                phone: order.phone,
                city: order.city,
                streetAddress: order.address
            }
        }

        // Créer le colis sur Olivraison
        const response = await olivraison.createPackage(packageData)

        if (response && response.trackingID) {
            // Mettre à jour la commande locale
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    trackingID: response.trackingID,
                    deliveryStatus: response.status || 'CREATED',
                    deliverySyncAt: new Date(),
                    status: 'CONFIRMED' // Automatiquement passer à confirmé si envoyé à livraison
                }
            })

            revalidatePath('/admin/orders')
            revalidatePath(`/admin/orders/${orderId}`)

            return {
                success: true,
                trackingID: response.trackingID,
                message: 'Commande envoyée à Olivraison avec succès'
            }
        }

        throw new Error('Réponse invalide de l\'API Olivraison')
    } catch (error: any) {
        console.error('Erreur Sync Olivraison:', error)
        return {
            success: false,
            error: error.message || 'Erreur lors de la synchronisation avec Olivraison'
        }
    }
}

/**
 * Récupérer le sticker de livraison
 */
export async function getOrderShippingLabel(orderId: string) {
    try {
        await verifyAdmin()
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { trackingID: true }
        })

        if (!order || !order.trackingID) {
            throw new Error('Aucun tracking ID pour cette commande')
        }

        const response = await olivraison.getSticker([order.trackingID])

        // La réponse contient une liste, on prend le premier
        if (response && response[0]) {
            return {
                success: true,
                stickerUrl: response[0].stickerFilePath,
                sipUrl: response[0].sipFilePath
            }
        }

        throw new Error('Impossible de générer l\'étiquette')
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

