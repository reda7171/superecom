'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schéma de validation pour un pack
const PackSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    price: z.number().positive('Le prix doit être positif'),
    image: z.string().url('L\'URL de l\'image est invalide').optional(),
    bookIds: z.array(z.string().uuid()).min(1, 'Le pack doit contenir au moins un livre'),
})

export type PackInput = z.infer<typeof PackSchema>

export type PackResult =
    | { success: true; packId: string }
    | { success: false; error: string }

/**
 * Créer un nouveau pack
 */
export async function createPack(input: PackInput): Promise<PackResult> {
    try {
        const validatedData = PackSchema.parse(input)

        const pack = await prisma.pack.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                price: validatedData.price,
                image: validatedData.image,
                active: true,
                books: {
                    create: validatedData.bookIds.map((bookId) => ({
                        bookId,
                    })),
                },
            },
        })

        revalidatePath('/admin/packs')
        revalidatePath('/')

        return {
            success: true,
            packId: pack.id,
        }
    } catch (error) {
        console.error('Erreur lors de la création du pack:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: 'Une erreur est survenue lors de la création du pack',
        }
    }
}

/**
 * Mettre à jour un pack
 */
export async function updatePack(
    id: string,
    input: PackInput
): Promise<PackResult> {
    try {
        const validatedData = PackSchema.parse(input)

        // Supprimer les anciennes relations
        await prisma.packBook.deleteMany({
            where: { packId: id },
        })

        // Mettre à jour le pack avec les nouvelles relations
        await prisma.pack.update({
            where: { id },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                price: validatedData.price,
                image: validatedData.image,
                books: {
                    create: validatedData.bookIds.map((bookId) => ({
                        bookId,
                    })),
                },
            },
        })

        revalidatePath('/admin/packs')
        revalidatePath('/')

        return {
            success: true,
            packId: id,
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du pack:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: 'Une erreur est survenue lors de la mise à jour du pack',
        }
    }
}

/**
 * Supprimer un pack
 */
export async function deletePack(id: string): Promise<PackResult> {
    try {
        await prisma.pack.delete({
            where: { id },
        })

        revalidatePath('/admin/packs')
        revalidatePath('/')

        return {
            success: true,
            packId: id,
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du pack:', error)
        return {
            success: false,
            error: 'Impossible de supprimer le pack',
        }
    }
}

/**
 * Activer/Désactiver un pack
 */
export async function togglePackStatus(
    id: string,
    active: boolean
): Promise<PackResult> {
    try {
        await prisma.pack.update({
            where: { id },
            data: { active },
        })

        revalidatePath('/admin/packs')
        revalidatePath('/')

        return {
            success: true,
            packId: id,
        }
    } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        return {
            success: false,
            error: 'Impossible de changer le statut du pack',
        }
    }
}
