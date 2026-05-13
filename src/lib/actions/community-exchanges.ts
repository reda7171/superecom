'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser, checkExchangeEligibility } from '@/lib/actions/community-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createNotification } from './community-notifications'

const ExchangeRequestSchema = z.object({
    bookRequestedId: z.string().uuid(),
    bookOfferedId: z.string().uuid().optional(), // Optionnel si crédit
    message: z.string().optional(),
    type: z.literal('DIRECT'),
    deliveryMethod: z.enum(['MEETUP', 'SHIPPING', 'LOCKER']).optional(),
    meetingPoint: z.string().optional(),
    meetingDate: z.string().optional(),
})

export type ExchangeResult =
    | { success: true; exchangeId: string }
    | { success: false; error: string }

export async function createExchangeRequest(formData: FormData): Promise<ExchangeResult> {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Vous devez être connecté" }

    const rawData = {
        bookRequestedId: formData.get('bookRequestedId'),
        bookOfferedId: formData.get('bookOfferedId') || undefined,
        message: formData.get('message'),
        type: formData.get('type') || 'DIRECT',
        deliveryMethod: formData.get('deliveryMethod') || undefined,
        meetingPoint: formData.get('meetingPoint') || undefined,
        meetingDate: formData.get('meetingDate') || undefined,
    }

    try {
        const data = ExchangeRequestSchema.parse(rawData)

        // 1. Vérifier le livre demandé
        const requestedBook = await (prisma as any).exchangeBook.findUnique({
            where: { id: data.bookRequestedId },
            include: { owner: true }
        })

        if (!requestedBook || requestedBook.status !== 'AVAILABLE') {
            return { success: false, error: "Ce livre n'est plus disponible" }
        }

        if (requestedBook.ownerId === user.id) {
            return { success: false, error: "Vous ne pouvez pas échanger votre propre livre" }
        }

        // 3. Vérifier l'éligibilité (Au moins une commande effectuée)
        const isEligible = await checkExchangeEligibility(user)
        if (!isEligible) {
            return { success: false, error: "Vous devez avoir effectué au moins une commande sur Riwaya pour accéder au système d'échange." }
        }

        // 2. Vérifier le livre offert (si échange direct)
        if (data.type === 'DIRECT' && data.bookOfferedId) {
            const offeredBook = await (prisma as any).exchangeBook.findUnique({
                where: { id: data.bookOfferedId }
            })

            if (!offeredBook || offeredBook.ownerId !== user.id) {
                return { success: false, error: "Le livre proposé n'est pas valide" }
            }
            if (offeredBook.status !== 'AVAILABLE') {
                return { success: false, error: "Votre livre proposé n'est pas disponible" }
            }
        }

        // 3. Créer l'échange
        const exchange = await (prisma as any).exchange.create({
            data: {
                requesterId: user.id,
                responderId: requestedBook.ownerId,
                bookRequestedId: requestedBook.id,
                bookOfferedId: data.bookOfferedId || null,
                type: 'DIRECT',
                message: data.message || '',
                status: 'PENDING',
                deliveryMethod: data.deliveryMethod || null,
                meetingPoint: data.meetingPoint || null,
                meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
            }
        })

        // 4. Mettre à jour le statut des livres ? 
        // Non, on garde AVAILABLE tant que l'échange n'est pas ACCEPTED.
        // Mais on pourrait mettre "PENDING" pour éviter double demande instantanée.
        // Pour l'instant on autorise plusieurs demandes sur un même livre (premier arrivé premier servi à l'acceptation).

        revalidatePath('/community')
        return { success: true, exchangeId: exchange.id }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: "Erreur lors de la création de la demande" }
    }
}

/**
 * Récupérer les détails pour la page de demande
 */
export async function getExchangeDetails(bookId: string) {
    const user = await getCommunityUser()
    if (!user) return null

    const book = await (prisma as any).exchangeBook.findUnique({
        where: { id: bookId },
        include: {
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    city: true,
                    rating: true,
                    credits: true,
                }
            }
        }
    })

    if (!book) return null

    // Récupérer mes livres disponibles pour l'échange
    const myBooks = await (prisma as any).exchangeBook.findMany({
        where: {
            ownerId: user.id,
            status: 'AVAILABLE'
        }
    })

    // Vérifier l'éligibilité
    const isEligible = await checkExchangeEligibility(user)

    return { book, myBooks, currentUser: user, isEligible }
}

/**
 * Récupérer les échanges de l'utilisateur
 */
export async function getUserExchanges() {
    const user = await getCommunityUser()
    if (!user) return { received: [], sent: [] }

    const received = await (prisma as any).exchange.findMany({
        where: { responderId: user.id },
        include: {
            requester: { select: { fullName: true, rating: true, city: true } },
            bookRequested: true,
            bookOffered: true,
            rating: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    const sent = await (prisma as any).exchange.findMany({
        where: { requesterId: user.id },
        include: {
            responder: { select: { fullName: true, rating: true, city: true } },
            bookRequested: true,
            bookOffered: true,
            rating: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    return { received, sent }
}

/**
 * Accepter une demande d'échange
 */
export async function acceptExchange(exchangeId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non authentifié" }

    // Démarrer une transaction pour la cohérence
    try {
        await (prisma as any).$transaction(async (tx: any) => {
            const exchange = await tx.exchange.findUnique({
                where: { id: exchangeId },
                include: { bookRequested: true, bookOffered: true, requester: true }
            })

            if (!exchange || exchange.responderId !== user.id) {
                throw new Error("Échange introuvable ou non autorisé")
            }

            if (exchange.status !== 'PENDING') {
                throw new Error("Cet échange n'est plus en attente")
            }

            // Vérifier validité finale
            if (exchange.bookRequested.status !== 'AVAILABLE') {
                throw new Error("Votre livre n'est plus disponible")
            }

            if (exchange.type === 'DIRECT' && exchange.bookOffered) {
                if (exchange.bookOffered.status !== 'AVAILABLE') {
                    throw new Error("Le livre proposé n'est plus disponible")
                }
            }


            // Mettre à jour l'échange
            await tx.exchange.update({
                where: { id: exchangeId },
                data: { status: 'ACCEPTED' }
            })

            // Marquer les livres comme réservés/échangés
            await tx.exchangeBook.update({
                where: { id: exchange.bookRequestedId },
                data: { status: 'EXCHANGED' }
            })

            if (exchange.bookOfferedId) {
                await tx.exchangeBook.update({
                    where: { id: exchange.bookOfferedId },
                    data: { status: 'EXCHANGED' }
                })
            }

            // Notifier le demandeur
            await createNotification({
                userId: exchange.requesterId,
                type: 'EXCHANGE_ACCEPTED',
                title: 'Échange accepté !',
                message: `${(user as any).fullName} a accepté votre demande d'échange pour "${exchange.bookRequested.title}"`,
                link: `/community/exchanges`
            })
        })

        revalidatePath('/community/exchanges')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de l'acceptation" }
    }
}

/**
 * Refuser une demande d'échange
 */
export async function rejectExchange(exchangeId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non authentifié" }

    try {
        const exchange = await (prisma as any).exchange.findUnique({
            where: { id: exchangeId },
            include: { bookRequested: true }
        })

        if (!exchange || exchange.responderId !== user.id) {
            return { success: false, error: "Non autorisé" }
        }

        await (prisma as any).exchange.update({
            where: { id: exchangeId },
            data: { status: 'REJECTED' } // Changed from CANCELLED to REJECTED
        })

        // Marquer les livres comme à nouveau disponibles
        await (prisma as any).exchangeBook.update({
            where: { id: exchange.bookRequestedId },
            data: { status: 'AVAILABLE' }
        })

        if (exchange.bookOfferedId) {
            await (prisma as any).exchangeBook.update({
                where: { id: exchange.bookOfferedId },
                data: { status: 'AVAILABLE' }
            })
        }
        revalidatePath('/community/exchanges')
        return { success: true }
    } catch {
        return { success: false, error: "Erreur lors du refus" }
    }
}

/**
 * Finaliser un échange
 */
// Finaliser un échange & Transférer la propriété
export async function completeExchange(exchangeId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non authentifié" }

    try {
        const exchange = await (prisma as any).exchange.findUnique({
            where: { id: exchangeId },
            include: {
                bookRequested: true,
                bookOffered: true
            }
        })

        if (!exchange) return { success: false, error: "Échange introuvable" }

        // Seules les parties de l'échange peuvent le compléter
        if (exchange.requesterId !== user.id && exchange.responderId !== user.id) {
            return { success: false, error: "Non autorisé" }
        }

        if (exchange.status !== 'ACCEPTED') {
            return { success: false, error: "L'échange doit être accepté avant d'être finalisé" }
        }

        // Transaction de transfert de propriété
        await (prisma as any).$transaction(async (tx: any) => {
            // 1. Mettre à jour le statut de l'échange
            await tx.exchange.update({
                where: { id: exchangeId },
                data: { status: 'COMPLETED' }
            })

            // 2. Transférer le livre demandé (du Responder -> Requester)
            await tx.exchangeBook.update({
                where: { id: exchange.bookRequestedId },
                data: {
                    ownerId: exchange.requesterId, // Nouveau propriétaire
                    status: 'EXCHANGED', // Marqué comme échangé
                }
            })

            // 3. Transférer le livre offert (du Requester -> Responder) si applicable (Echange DIRECT)
            if (exchange.bookOfferedId) {
                await tx.exchangeBook.update({
                    where: { id: exchange.bookOfferedId },
                    data: {
                        ownerId: exchange.responderId, // Nouveau propriétaire
                        status: 'EXCHANGED',
                    }
                })
            }

            // 4. Notifier l'autre partie
            const recipientId = exchange.requesterId === user.id ? exchange.responderId : exchange.requesterId
            await createNotification({
                userId: recipientId,
                type: 'EXCHANGE_COMPLETED',
                title: 'Échange terminé !',
                message: `${(user as any).fullName} a confirmé la réception et finalisé l'échange. Le livre est maintenant dans votre bibliothèque !`,
                link: `/community/exchanges`
            })
        })

        revalidatePath('/community')
        revalidatePath('/community/exchanges')
        return { success: true }
    } catch (error) {
        console.error('Erreur completeExchange:', error)
        return { success: false, error: "Erreur lors de la finalisation" }
    }
}
