'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/actions/auth'
import { createAuditLog } from './audit'
import { olivraison } from '@/lib/delivery/olivraison'
import { sendTelegramMessage } from '@/lib/telegram'

import { OrderStatus } from '@prisma/client'

/**
 * Mettre à jour le statut d'une commande
 * Si RETURNED ou CANCELLED : réintègre le stock des livres
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
        await verifyAdmin()

        // Récupérer la commande avec items pour gérer le stock
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        book: { select: { id: true, title: true } }
                    }
                }
            }
        })

        if (!order) return { success: false, error: 'Commande introuvable' }

        const prevStatus = order.status
        const isNowReturned = status === 'RETURNED' || status === 'CANCELLED'
        // Statuts qui n'avaient pas encore décrémenté (ne pas remettre le stock)
        const wasNeverShipped = ['PENDING', 'CANCELLED', 'RETURNED'].includes(prevStatus)

        await prisma.$transaction(async (tx) => {
            // Mise à jour statut + historique
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status,
                    statusHistory: {
                        create: {
                            status,
                            comment: `Statut mis à jour manuellement par l'administrateur`,
                            createdBy: 'ADMIN'
                        }
                    }
                }
            })

            // Réintégrer le stock si retour/annulation d'une commande qui avait décrémenté le stock
            if (isNowReturned && !wasNeverShipped) {
                for (const item of order.items) {
                    if (item.type === 'BOOK' && item.bookId) {
                        await tx.book.update({
                            where: { id: item.bookId },
                            data: { stock: { increment: item.quantity } }
                        })
                    }
                    // Note: les packs ne gèrent pas de stock direct
                }
            }

            // Empêcher le double remboursement si on annule depuis RETURNED
            if (status === 'CANCELLED' && prevStatus === 'RETURNED') {
                // Déjà remis en stock, ne rien faire
            }
        })

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)

        const stockNote = isNowReturned && !wasNeverShipped
            ? ` | Stock des livres réintégré (${order.items.filter(i => i.type === 'BOOK').length} articles)`
            : ''

        await createAuditLog({
            action: 'UPDATE_STATUS',
            entity: 'ORDER',
            entityId: orderId,
            details: `Statut: ${prevStatus} → ${status}${stockNote}`
        })

        // Notification Telegram si retour
        if (status === 'RETURNED') {
            const msg = `📦 *Retour Commande*\n\n🆔 \`${orderId.slice(0, 8)}\`\n👤 ${order.fullName}\n📱 ${order.phone}\n💰 ${order.total} MAD\n📍 ${order.city}${stockNote}`
            sendTelegramMessage(msg).catch(console.error)
        }

        return {
            success: true,
            message: `Statut mis à jour vers ${status}${stockNote}`
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
 * Modifier les informations d'une commande
 */
export async function updateOrderDetails(orderId: string, data: {
    fullName?: string
    phone?: string
    address?: string
    city?: string
    total?: number
    comment?: string
}) {
    try {
        await verifyAdmin()

        await prisma.order.update({
            where: { id: orderId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        })

        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)

        await createAuditLog({
            action: 'UPDATE_DETAILS',
            entity: 'ORDER',
            entityId: orderId,
            details: `Informations de la commande modifiées par l'administrateur`
        })

        return { success: true }
    } catch (error) {
        console.error('Erreur mise à jour commande:', error)
        return { success: false, error: 'Impossible de modifier la commande' }
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
                                costPrice: true,
                            }
                        },
                        pack: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                costPrice: true,
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

        if (response && response[0] && response[0].stickerFilePath) {

            return {
                success: true,
                stickerUrl: response[0].stickerFilePath,
                sipUrl: response[0].sipFilePath
            }
        }

        console.error('❌ Shipping Label Error for trackingID:', order.trackingID, 'Response:', JSON.stringify(response, null, 2))

        let errorMsg = 'Impossible de générer l\'étiquette'
        if (!response || response.length === 0) {
            errorMsg = 'L\'API Olivraison n\'a retourné aucune étiquette. La commande est peut-être trop récente.'
        } else if (!response[0].stickerFilePath) {
            errorMsg = 'L\'étiquette n\'est pas encore disponible pour ce colis.'
        }

        throw new Error(errorMsg)
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Suppression groupée de commandes (Bulk Delete)
 */
export async function bulkDeleteOrders(orderIds: string[]) {
    try {
        await verifyAdmin()

        if (!orderIds || orderIds.length === 0) {
            return {
                success: false,
                error: 'Aucune commande sélectionnée'
            }
        }

        // Supprimer les commandes (les items et l'historique de statut seront supprimés via Cascade ou manuellement si nécessaire)
        // Note: Dans le schéma, OrderItem et OrderStatusHistory doivent avoir onDelete: Cascade sur orderId
        await prisma.order.deleteMany({
            where: {
                id: { in: orderIds }
            }
        })

        revalidatePath('/admin/orders')

        await createAuditLog({
            action: 'BULK_DELETE',
            entity: 'ORDER',
            entityId: 'MULTIPLE',
            details: `Suppression groupée de ${orderIds.length} commandes`
        })

        sendTelegramMessage(`🗑️ *Suppression Massive*\n\n${orderIds.length} commandes ont été supprimées par l'administrateur.\n🕒 ${new Date().toLocaleString('fr-FR')}`).catch(console.error)

        return {
            success: true,
            message: `${orderIds.length} commandes supprimées avec succès`
        }
    } catch (error) {
        console.error('Erreur lors de la suppression groupée des commandes:', error)
        return {
            success: false,
            error: 'Une erreur est survenue lors de la suppression'
        }
    }
}
