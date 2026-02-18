'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/actions/auth'
import { createAuditLog } from './audit'

// Schéma de validation pour un pack
const PackSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    price: z.number().positive('Le prix doit être supérieur à 0'),
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
        await verifyAdmin()
        const validatedData = PackSchema.parse(input)

        // Vérifier doublon par nom
        const existing = await prisma.pack.findFirst({
            where: { name: validatedData.name }
        })

        if (existing) {
            return {
                success: false,
                error: `Un pack portant le nom "${validatedData.name}" existe déjà.`
            }
        }

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
    } catch (error: any) {
        console.error('Erreur lors de la création du pack:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: error.message || 'Une erreur est survenue lors de la création du pack',
        }
    }
}

/**
 * Récupérer un pack par son ID
 */
export async function getPackById(id: string) {
    try {
        const pack = await prisma.pack.findUnique({
            where: { id },
            include: {
                books: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                price: true,
                            }
                        }
                    }
                }
            },
        })

        if (!pack) {
            return {
                success: false,
                error: 'Pack introuvable',
                data: null,
            }
        }

        return {
            success: true,
            data: pack,
            error: null,
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du pack:', error)
        return {
            success: false,
            error: 'Une erreur est survenue',
            data: null,
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
        await verifyAdmin()
        const validatedData = PackSchema.parse(input)

        // Transaction pour éviter les états incohérents
        await prisma.$transaction(async (tx) => {
            // Supprimer les anciennes relations
            await tx.packBook.deleteMany({
                where: { packId: id },
            })

            // Mettre à jour le pack avec les nouvelles relations
            await tx.pack.update({
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
        })

        revalidatePath('/admin/packs')
        revalidatePath('/')

        return {
            success: true,
            packId: id,
        }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour du pack:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: error.message || 'Une erreur est survenue lors de la mise à jour du pack',
        }
    }
}

/**
 * Supprimer un pack
 */
export async function deletePack(id: string): Promise<PackResult> {
    try {
        await verifyAdmin()
        await prisma.pack.delete({
            where: { id },
        })

        revalidatePath('/admin/packs')
        revalidatePath('/')

        return {
            success: true,
            packId: id,
        }
    } catch (error: any) {
        console.error('Erreur lors de la suppression du pack:', error)
        return {
            success: false,
            error: error.message || 'Impossible de supprimer le pack',
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
        await verifyAdmin()
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
    } catch (error: any) {
        console.error('Erreur lors du changement de statut:', error)
        return {
            success: false,
            error: error.message || 'Impossible de changer le statut du pack',
        }
    }
}
