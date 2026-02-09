'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './community-notifications'
import { z } from 'zod'

const ratingSchema = z.object({
    exchangeId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
})

// Créer une évaluation après un échange
export async function createRating(formData: FormData) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non authentifié" }

    const data = {
        exchangeId: formData.get('exchangeId') as string,
        rating: parseInt(formData.get('rating') as string),
        comment: formData.get('comment') as string || undefined
    }

    const validation = ratingSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, error: "Données invalides" }
    }

    try {
        // Vérifier que l'échange existe et est complété
        const exchange = await prisma.exchange.findUnique({
            where: { id: data.exchangeId },
            include: {
                requester: true,
                responder: true
            }
        })

        if (!exchange) {
            return { success: false, error: "Échange introuvable" }
        }

        if (exchange.status !== 'ACCEPTED') {
            return { success: false, error: "L'échange doit être accepté pour être évalué" }
        }

        // Vérifier que l'utilisateur fait partie de l'échange
        if (exchange.requesterId !== user.id && exchange.responderId !== user.id) {
            return { success: false, error: "Non autorisé" }
        }

        // Déterminer qui est évalué
        const toUserId = exchange.requesterId === user.id
            ? exchange.responderId
            : exchange.requesterId

        // Vérifier qu'une évaluation n'existe pas déjà
        const existingRating = await prisma.rating.findUnique({
            where: { exchangeId: data.exchangeId }
        })

        if (existingRating) {
            return { success: false, error: "Vous avez déjà évalué cet échange" }
        }

        // Créer l'évaluation
        const rating = await prisma.rating.create({
            data: {
                exchangeId: data.exchangeId,
                fromUserId: user.id,
                toUserId,
                rating: data.rating,
                comment: data.comment
            }
        })

        // Mettre à jour la note moyenne de l'utilisateur évalué
        const userRatings = await prisma.rating.findMany({
            where: { toUserId }
        })

        const averageRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length

        await prisma.user.update({
            where: { id: toUserId },
            data: { rating: averageRating }
        })

        // Notifier l'utilisateur évalué
        await createNotification({
            userId: toUserId,
            type: 'RATING_RECEIVED',
            title: 'Nouvelle évaluation',
            message: `${user.fullName} vous a donné ${data.rating} étoile${data.rating > 1 ? 's' : ''}`,
            link: `/community`
        })

        revalidatePath('/community/exchanges')
        return { success: true, rating }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la création de l'évaluation" }
    }
}

// Vérifier si un échange peut être évalué
export async function canRateExchange(exchangeId: string) {
    const user = await getCommunityUser()
    if (!user) return false

    try {
        const exchange = await prisma.exchange.findUnique({
            where: { id: exchangeId }
        })

        if (!exchange) return false
        if (exchange.status !== 'ACCEPTED') return false
        if (exchange.requesterId !== user.id && exchange.responderId !== user.id) return false

        // Vérifier qu'une évaluation n'existe pas déjà
        const existingRating = await prisma.rating.findUnique({
            where: { exchangeId }
        })

        return !existingRating
    } catch (error) {
        return false
    }
}

// Récupérer les évaluations d'un utilisateur
export async function getUserRatings(userId: string) {
    try {
        const ratings = await prisma.rating.findMany({
            where: { toUserId: userId },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        fullName: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return ratings
    } catch (error) {
        return []
    }
}
