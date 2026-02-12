'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const WishlistSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    author: z.string().optional(),
})

export async function addToWishlist(formData: FormData) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non connecté" }

    try {
        const data = WishlistSchema.parse({
            title: formData.get('title'),
            author: formData.get('author') || undefined,
        })

        await (prisma as any).wishlist.create({
            data: {
                userId: user.id,
                title: data.title,
                author: data.author
            }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de l'ajout" }
    }
}

export async function removeFromWishlist(id: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non connecté" }

    try {
        await (prisma as any).wishlist.delete({
            where: {
                id,
                userId: user.id
            }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" }
    }
}

export async function getWishlist() {
    const user = await getCommunityUser()
    if (!user) return []

    try {
        return await (prisma as any).wishlist.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        return []
    }
}
