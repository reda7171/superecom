'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin } from './auth'
import { createAuditLog } from './audit'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sendTelegramMessage } from '@/lib/telegram'

const ReviewSchema = z.object({
    productId: z.string().uuid(),
    fullName: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    rating: z.number().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5'),
    comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères'),
})

export async function createReview(data: z.infer<typeof ReviewSchema>) {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`review_${ip}`, { limit: 2, windowMs: 60000 }) // 2 avis par minute max

    if (!limiter.success) {
        return { success: false, error: "Trop de commentaires. Veuillez patienter une minute." }
    }

    try {
        const validated = ReviewSchema.parse(data)

        // Vérifier doublon (même nom pour même livre)
        const existing = await prisma.review.findFirst({
            where: {
                productId: validated.productId,
                fullName: validated.fullName
            }
        })

        if (existing) {
            return {
                success: false,
                error: "Vous avez déjà envoyé un avis pour ce livre. Merci de votre contribution !"
            }
        }

        const review = await prisma.review.create({
            data: {
                ...validated,
                isApproved: false, // En attente de modération
            }
        })

        // Notification Telegram pour le nouvel avis
        const { sendReviewNotification } = await import('@/lib/telegram')
        sendReviewNotification(review).catch(console.error)

        revalidatePath(`/products/${validated.productId}`)
        return { success: true }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues?.[0]?.message || 'Vérifiez les champs du formulaire.';
            return { success: false, error: firstError };
        }
        return { success: false, error: error.message || 'Erreur lors de l\'envoi de l\'avis' }
    }
}

export async function getBookReviews(productId: string) {
    // Public action for product pages
    return prisma.review.findMany({
        where: { productId, isApproved: true },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getPendingReviews() {
    try {
        await verifyAdmin()
        return prisma.review.findMany({
            where: { isApproved: false },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        return []
    }
}

export async function approveReview(id: string) {
    try {
        await verifyAdmin()
        await prisma.review.update({
            where: { id },
            data: { isApproved: true }
        })
        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de l\'approbation' }
    }
}

export async function deleteReview(id: string) {
    try {
        await verifyAdmin()
        await prisma.review.delete({ where: { id } })
        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la suppression' }
    }
}

/**
 * Récupérer tous les avis avec filtres (admin)
 */
export async function getAllReviews(filter?: 'all' | 'approved' | 'pending') {
    try {
        await verifyAdmin()
        const reviews = await prisma.review.findMany({
            where: filter === 'approved'
                ? { isApproved: true }
                : filter === 'pending'
                    ? { isApproved: false }
                    : {},
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return reviews
    } catch (error) {
        console.error('Erreur récupération avis:', error)
        return []
    }
}

/**
 * Récupérer la note moyenne d'un livre
 */
export async function getBookAverageRating(productId: string) {
    try {
        // Public action
        const result = await prisma.review.aggregate({
            where: {
                productId,
                isApproved: true,
            },
            _avg: {
                rating: true,
            },
            _count: {
                id: true,
            },
        })

        return {
            average: result._avg.rating || 0,
            count: result._count.id,
        }
    } catch (error) {
        console.error('Erreur calcul note moyenne:', error)
        return { average: 0, count: 0 }
    }
}

/**
 * Statistiques des avis
 */
export async function getReviewsStats() {
    try {
        await verifyAdmin()
        const [total, approved, pending] = await Promise.all([
            prisma.review.count(),
            prisma.review.count({ where: { isApproved: true } }),
            prisma.review.count({ where: { isApproved: false } }),
        ])

        return { total, approved, pending }
    } catch (error) {
        console.error('Erreur stats avis:', error)
        return { total: 0, approved: 0, pending: 0 }
    }
}
