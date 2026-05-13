'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const WishlistSchema = z.object({
    bookId: z.string().optional(),
    packId: z.string().optional(),
    title: z.string().min(1, 'Le titre est requis'),
    author: z.string().optional(),
})

export async function addToWishlist(formData: FormData) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non connecté" }

    try {
        const data = WishlistSchema.parse({
            bookId: formData.get('bookId') || undefined,
            title: formData.get('title'),
            author: formData.get('author') || undefined,
        })

        const user = await getCommunityUser() // Already checked but for TS
        if (!user) return { success: false, error: "Non connecté" }

        // Vérifier doublon
        let whereClause: any = { userId: user.id }

        if (data.bookId) {
            whereClause.bookId = data.bookId
        } else if (data.packId) {
            whereClause.packId = data.packId
        } else {
            whereClause.title = data.title
            if (data.author) whereClause.author = data.author
        }

        const existing = await (prisma as any).wishlist.findFirst({
            where: whereClause
        })

        if (existing) return { success: true }

        await (prisma as any).wishlist.create({
            data: {
                userId: user.id,
                bookId: data.bookId,
                packId: data.packId,
                title: data.title,
                author: data.author
            }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        console.error('Add to wishlist error:', error)
        return { success: false, error: "Erreur lors de l'ajout" }
    }
}

export async function removeFromWishlist(id: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non connecté" }

    try {
        // Support suppression via ID de wishlist OU ID de livre
        const whereClause: any = { userId: user.id }

        // Si l'ID ressemble à un UUID, on suppose que c'est l'ID de la wishlist
        // Mais si on passe l'ID du livre, on doit chercher par bookId
        // Pour être sûr, on essaie de supprimer par ID wishlist d'abord

        // Approche simple: on essaie de supprimer par ID (wishlist) OU par bookId
        const deleted = await (prisma as any).wishlist.deleteMany({
            where: {
                userId: user.id,
                OR: [
                    { id: id },
                    { bookId: id },
                    { packId: id }
                ]
            }
        })

        if (deleted.count === 0) {

        }

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        console.error("Remove from wishlist error:", error)
        return { success: false, error: "Erreur lors de la suppression" }
    }
}

export async function getWishlist() {
    const user = await getCommunityUser()
    if (!user) return []

    try {
        return await (prisma as any).wishlist.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        image: true,
                        price: true,
                        category: true
                    }
                },
                pack: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        price: true
                    }
                }
            }
        })
    } catch (error) {
        console.error('Get wishlist error:', error)
        return []
    }
}
