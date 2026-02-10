'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './auth'

/**
 * Récupérer tous les échanges pour l'admin
 */
export async function getAllExchanges() {
    try {
        await verifyAdmin()
        const exchanges = await (prisma as any).exchange.findMany({
            include: {
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        city: true,
                        rating: true,
                    }
                },
                responder: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        city: true,
                        rating: true,
                    }
                },
                bookRequested: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        condition: true,
                        image: true,
                    }
                },
                bookOffered: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        condition: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return exchanges
    } catch (error) {
        console.error('Erreur lors de la récupération des échanges:', error)
        return []
    }
}

/**
 * Récupérer un échange par ID
 */
export async function getExchangeById(id: string) {
    try {
        await verifyAdmin()
        const exchange = await (prisma as any).exchange.findUnique({
            where: { id },
            include: {
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        city: true,
                        rating: true,
                        image: true,
                    }
                },
                responder: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        city: true,
                        rating: true,
                        image: true,
                    }
                },
                bookRequested: true,
                bookOffered: true,
            }
        })

        return exchange
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'échange:', error)
        return null
    }
}

/**
 * Mettre à jour le statut d'un échange (admin)
 */
export async function updateExchangeStatus(exchangeId: string, status: string) {
    try {
        await verifyAdmin()

        if (status === 'CANCELLED') {
            return await cancelExchange(exchangeId, 'Annulé par administrateur')
        }

        // Si l'échange est complété, marquer les livres comme échangés
        if (status === 'COMPLETED') {
            const exchange = await (prisma as any).exchange.findUnique({
                where: { id: exchangeId }
            })

            if (exchange) {
                if (exchange.bookRequestedId) {
                    await (prisma as any).exchangeBook.update({
                        where: { id: exchange.bookRequestedId },
                        data: { status: 'EXCHANGED' }
                    })
                }

                if (exchange.bookOfferedId) {
                    await (prisma as any).exchangeBook.update({
                        where: { id: exchange.bookOfferedId },
                        data: { status: 'EXCHANGED' }
                    })
                }
            }
        }

        await (prisma as any).exchange.update({
            where: { id: exchangeId },
            data: { status }
        })

        revalidatePath('/admin/exchanges')
        revalidatePath(`/admin/exchanges/${exchangeId}`)

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
 * Annuler un échange (admin)
 */
export async function cancelExchange(exchangeId: string, reason?: string) {
    try {
        await verifyAdmin()

        const exchange = await (prisma as any).exchange.findUnique({
            where: { id: exchangeId }
        })

        if (!exchange) {
            return { success: false, error: 'Échange introuvable' }
        }

        // Mettre à jour le statut
        await (prisma as any).exchange.update({
            where: { id: exchangeId },
            data: {
                status: 'CANCELLED',
                adminNote: reason
            }
        })

        // Remettre les livres disponibles
        if (exchange.bookRequestedId) {
            await (prisma as any).exchangeBook.update({
                where: { id: exchange.bookRequestedId },
                data: { status: 'AVAILABLE' }
            })
        }

        if (exchange.bookOfferedId) {
            await (prisma as any).exchangeBook.update({
                where: { id: exchange.bookOfferedId },
                data: { status: 'AVAILABLE' }
            })
        }

        revalidatePath('/admin/exchanges')

        return {
            success: true,
            message: 'Échange annulé avec succès'
        }
    } catch (error) {
        console.error('Erreur lors de l\'annulation de l\'échange:', error)
        return {
            success: false,
            error: 'Impossible d\'annuler l\'échange'
        }
    }
}

/**
 * Obtenir les statistiques des échanges
 */
export async function getExchangeStats() {
    try {
        await verifyAdmin()

        const [total, pending, accepted, completed, cancelled] = await Promise.all([
            (prisma as any).exchange.count(),
            (prisma as any).exchange.count({ where: { status: 'PENDING' } }),
            (prisma as any).exchange.count({ where: { status: 'ACCEPTED' } }),
            (prisma as any).exchange.count({ where: { status: 'COMPLETED' } }),
            (prisma as any).exchange.count({ where: { status: 'CANCELLED' } }),
        ])

        return {
            total,
            pending,
            accepted,
            completed,
            cancelled,
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error)
        return {
            total: 0,
            pending: 0,
            accepted: 0,
            completed: 0,
            cancelled: 0,
        }
    }
}
