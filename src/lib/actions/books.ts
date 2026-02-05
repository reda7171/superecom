'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schéma de validation pour un livre
const BookSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    author: z.string().min(1, 'L\'auteur est requis'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    isbn: z.string().optional(),
    price: z.number().positive('Le prix doit être positif'),
    stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
    image: z.string().url('L\'URL de l\'image est invalide'),
    category: z.string().optional(),
})

export type BookInput = z.infer<typeof BookSchema>

export type BookResult =
    | { success: true; bookId: string }
    | { success: false; error: string }

/**
 * Créer un nouveau livre
 */
export async function createBook(input: BookInput): Promise<BookResult> {
    try {
        const validatedData = BookSchema.parse(input)

        const book = await prisma.book.create({
            data: {
                ...validatedData,
                active: true,
            },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        return {
            success: true,
            bookId: book.id,
        }
    } catch (error) {
        console.error('Erreur lors de la création du livre:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: 'Une erreur est survenue lors de la création du livre',
        }
    }
}

/**
 * Mettre à jour un livre
 */
export async function updateBook(
    id: string,
    input: BookInput
): Promise<BookResult> {
    try {
        const validatedData = BookSchema.parse(input)

        await prisma.book.update({
            where: { id },
            data: validatedData,
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        return {
            success: true,
            bookId: id,
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du livre:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: 'Une erreur est survenue lors de la mise à jour du livre',
        }
    }
}

/**
 * Supprimer un livre
 */
export async function deleteBook(id: string): Promise<BookResult> {
    try {
        await prisma.book.delete({
            where: { id },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        return {
            success: true,
            bookId: id,
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du livre:', error)
        return {
            success: false,
            error: 'Impossible de supprimer le livre',
        }
    }
}

/**
 * Activer/Désactiver un livre
 */
export async function toggleBookStatus(
    id: string,
    active: boolean
): Promise<BookResult> {
    try {
        await prisma.book.update({
            where: { id },
            data: { active },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        return {
            success: true,
            bookId: id,
        }
    } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        return {
            success: false,
            error: 'Impossible de changer le statut du livre',
        }
    }
}
