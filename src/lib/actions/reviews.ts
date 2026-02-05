'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ReviewSchema = z.object({
    bookId: z.string().uuid(),
    fullName: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères'),
})

export async function createReview(data: z.infer<typeof ReviewSchema>) {
    try {
        const validated = ReviewSchema.parse(data)

        await prisma.review.create({
            data: {
                ...validated,
                isApproved: true, // Pour l'instant on approuve automatiquement (MVP)
            }
        })

        revalidatePath(`/books/${validated.bookId}`)
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de l\'envoi de l\'avis' }
    }
}

export async function getBookReviews(bookId: string) {
    return prisma.review.findMany({
        where: { bookId, isApproved: true },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getPendingReviews() {
    return prisma.review.findMany({
        where: { isApproved: false },
        include: { book: true },
        orderBy: { createdAt: 'desc' }
    })
}

export async function approveReview(id: string) {
    try {
        await prisma.review.update({
            where: { id },
            data: { isApproved: true }
        })
        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de l\'approbation' }
    }
}

export async function deleteReview(id: string) {
    try {
        await prisma.review.delete({ where: { id } })
        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}
