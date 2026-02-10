'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/actions/auth'
import { createAuditLog } from './audit'

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
        await verifyAdmin()
        const validatedData = BookSchema.parse(input)

        const book = await prisma.book.create({
            data: {
                ...validatedData,
                active: true,
            },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'CREATE',
            entity: 'BOOK',
            entityId: book.id,
            details: `Livre créé: ${book.title} par ${book.author}`
        })

        return {
            success: true,
            bookId: book.id,
        }
    } catch (error: any) {
        console.error('Erreur lors de la création du livre:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: error.message || 'Une erreur est survenue lors de la création du livre',
        }
    }
}

/**
 * Récupérer un livre par son ID
 */
export async function getBookById(id: string) {
    try {
        const book = await prisma.book.findUnique({
            where: { id },
        })

        if (!book) {
            return {
                success: false,
                error: 'Livre introuvable',
                data: null,
            }
        }

        return {
            success: true,
            data: book,
            error: null,
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du livre:', error)
        return {
            success: false,
            error: 'Une erreur est survenue',
            data: null,
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
        await verifyAdmin()
        const validatedData = BookSchema.parse(input)

        await prisma.book.update({
            where: { id },
            data: validatedData,
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'UPDATE',
            entity: 'BOOK',
            entityId: id,
            details: `Livre mis à jour: ${validatedData.title}`
        })

        return {
            success: true,
            bookId: id,
        }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour du livre:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: error.message || 'Une erreur est survenue lors de la mise à jour du livre',
        }
    }
}

/**
 * Supprimer un livre
 */
export async function deleteBook(id: string): Promise<BookResult> {
    try {
        await verifyAdmin()
        await prisma.book.delete({
            where: { id },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'DELETE',
            entity: 'BOOK',
            entityId: id,
        })

        return {
            success: true,
            bookId: id,
        }
    } catch (error: any) {
        console.error('Erreur lors de la suppression du livre:', error)
        return {
            success: false,
            error: error.message || 'Impossible de supprimer le livre',
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
        await verifyAdmin()
        await prisma.book.update({
            where: { id },
            data: { active },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'TOGGLE_STATUS',
            entity: 'BOOK',
            entityId: id,
            details: `Statut changé à: ${active ? 'Actif' : 'Inactif'}`
        })

        return {
            success: true,
            bookId: id,
        }
    } catch (error: any) {
        console.error('Erreur lors du changement de statut:', error)
        return {
            success: false,
            error: error.message || 'Impossible de changer le statut du livre',
        }
    }
}
