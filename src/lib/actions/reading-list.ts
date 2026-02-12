'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { z } from 'zod'
import { ReadingStatus } from '@prisma/client'

const AddBookSchema = z.object({
    bookId: z.string().optional(),
    title: z.string().min(1, 'Le titre est requis'),
    author: z.string().min(1, 'L\'auteur est requis'),
    cover: z.string().optional(),
    totalPages: z.number().min(1, 'Le nombre de pages doit être supérieur à 0'),
    status: z.nativeEnum(ReadingStatus).default(ReadingStatus.TO_READ),
})

const UpdateProgressSchema = z.object({
    id: z.string(),
    currentPage: z.number().min(0),
    status: z.nativeEnum(ReadingStatus).optional(),
})

/**
 * Récupérer la liste de lecture de l'utilisateur
 */
export async function getReadingList() {
    const user = await getCommunityUser()
    if (!user) return []

    return prisma.readingList.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            book: {
                select: {
                    id: true,
                    title: true,
                    author: true,
                    image: true
                }
            }
        }
    })
}

/**
 * Ajouter un livre à la liste de lecture
 */
export async function addToReadingList(data: z.infer<typeof AddBookSchema>) {
    const user = await getCommunityUser()
    if (!user) {
        return { success: false, error: 'Vous devez être connecté' }
    }

    try {
        const validated = AddBookSchema.parse(data)

        await prisma.readingList.create({
            data: {
                ...validated,
                userId: user.id,
                startedAt: validated.status === ReadingStatus.READING ? new Date() : null,
            }
        })

        revalidatePath('/community/reading-list')
        return { success: true }
    } catch (error) {
        console.error('Error adding to reading list:', error)
        return { success: false, error: 'Erreur lors de l\'ajout du livre' }
    }
}

/**
 * Mettre à jour la progression
 */
export async function updateReadingProgress(data: z.infer<typeof UpdateProgressSchema>) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: 'Non autorisé' }

    try {
        const validated = UpdateProgressSchema.parse(data)

        let updateData: any = {
            currentPage: validated.currentPage
        }

        const currentEntry = await prisma.readingList.findUnique({
            where: { id: validated.id }
        })

        if (!currentEntry) return { success: false, error: 'Entrée introuvable' }

        // Auto-update status based on pages
        if (validated.currentPage >= currentEntry.totalPages) {
            updateData.status = ReadingStatus.COMPLETED
            updateData.finishedAt = new Date()
            updateData.currentPage = currentEntry.totalPages
        } else if (validated.currentPage > 0 && currentEntry.status === ReadingStatus.TO_READ) {
            updateData.status = ReadingStatus.READING
            updateData.startedAt = new Date()
        }

        if (validated.status) {
            updateData.status = validated.status
        }

        await prisma.readingList.update({
            where: { id: validated.id, userId: user.id },
            data: updateData
        })

        revalidatePath('/community/reading-list')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Mise à jour échouée' }
    }
}

/**
 * Supprimer un livre de la liste
 */
export async function removeFromReadingList(id: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: 'Non autorisé' }

    try {
        await prisma.readingList.delete({
            where: { id, userId: user.id }
        })
        revalidatePath('/community/reading-list')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Suppression échouée' }
    }
}
