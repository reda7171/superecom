'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/actions/auth'
import { createAuditLog } from './audit'

// Schéma de validation pour un livre
import { getBooks as getBooksDb, BookFilters, getAllAuthors } from '@/lib/db/books'

const BookSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    author: z.string().min(1, 'L\'auteur est requis'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    longDescription: z.string().optional(),
    isbn: z.string().optional(),
    price: z.number().min(0),
    costPrice: z.number().min(0, 'Le coût ne peut pas être négatif').default(0),
    stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
    image: z.string().min(1, 'L\'image est requise'),
    category: z.string().optional(),
    language: z.string().optional().default('fr'),
    active: z.boolean().optional(),
    status: z.string().optional(),
    isBestSeller: z.boolean().optional(),
    previewUrl: z.string().optional(),
    isOriginal: z.boolean().optional().default(true),
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

        // Vérifier doublons
        const existing = await prisma.book.findFirst({
            where: {
                OR: [
                    validatedData.isbn ? { isbn: validatedData.isbn } : undefined,
                    { title: validatedData.title, author: validatedData.author }
                ].filter(Boolean) as any
            }
        })

        if (existing) {
            return {
                success: false,
                error: existing.isbn === validatedData.isbn
                    ? `Un livre avec l'ISBN ${existing.isbn} existe déjà.`
                    : `Le livre "${validatedData.title}" par ${validatedData.author} existe déjà.`
            }
        }

        const book = await prisma.book.create({
            data: {
                ...validatedData,
                active: validatedData.active ?? true,
                isOriginal: validatedData.isOriginal ?? true,
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

        // Normaliser l'image Base64 brute (ex: import depuis Odoo)
        // Note: /9j/ = en-tête JPEG base64, PAS un chemin local
        let image = book.image?.trim() || ''
        if (!image || image.startsWith('data:') || image.startsWith('http')) {
            // déjà valide
        } else if (image.startsWith('/9j/')) {
            image = 'data:image/jpeg;base64,' + image
        } else if (image.startsWith('iVBOR')) {
            image = 'data:image/png;base64,' + image
        } else if (!image.startsWith('/') && image.length > 100) {
            image = 'data:image/jpeg;base64,' + image
        }

        return {
            success: true,
            data: { ...book, image },
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
            data: {
                ...validatedData,
                longDescription: validatedData.longDescription || null,
            },
        })

        revalidatePath('/admin/books')
        revalidatePath('/books/[id]', 'page')
        revalidatePath('/[locale]/books/[id]', 'page')
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
 * Mise à jour rapide (stock et prix)
 */
export async function updateBookQuick(
    id: string,
    data: { price: number; stock: number; active: boolean }
): Promise<BookResult> {
    try {
        await verifyAdmin()
        const updated = await prisma.book.update({
            where: { id },
            data: {
                price: Number(data.price),
                stock: Number(data.stock),
                active: data.active
            },
        })

        if (updated.stock < 3) {
            const { sendLowStockNotification } = await import('@/lib/telegram')
            sendLowStockNotification({ id: updated.id, title: updated.title, stock: updated.stock }).catch(console.error)
        }

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'UPDATE',
            entity: 'BOOK',
            entityId: id,
            details: `Mise à jour rapide - Prix: ${data.price}, Stock: ${data.stock}`
        })

        return { success: true, bookId: id }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour rapide:', error)
        return { success: false, error: 'Impossible de mettre à jour le livre' }
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

/**
 * Approuver un livre (Admin)
 */
export async function approveBook(id: string): Promise<BookResult> {
    try {
        await verifyAdmin()
        await prisma.book.update({
            where: { id },
            data: { status: 'APPROVED', active: true },
        })

        revalidatePath('/admin/books/pending')
        revalidatePath('/admin/books')
        revalidatePath('/')

        return { success: true, bookId: id }
    } catch (error: any) {
        return { success: false, error: 'Impossible d\'approuver le livre' }
    }
}

/**
 * Rejeter un livre (Admin)
 */
export async function rejectBook(id: string): Promise<BookResult> {
    try {
        await verifyAdmin()
        await prisma.book.update({
            where: { id },
            data: { status: 'REJECTED', active: false },
        })

        revalidatePath('/admin/books/pending')
        revalidatePath('/admin/books')

        return { success: true, bookId: id }
    } catch (error: any) {
        return { success: false, error: 'Impossible de rejeter le livre' }
    }
}

/**
 * Récupérer tous les auteurs pour l'admin
 */
export async function fetchAllAuthors() {
    try {
        const authors = await getAllAuthors()
        return { success: true, data: authors }
    } catch (error) {
        console.error('Error fetching authors:', error)
        return { success: false, error: 'Failed to fetch authors', data: [] }
    }
}

/**
 * Récupérer les livres avec pagination pour le client (Server Action)
 */
export async function fetchBooks(filters: BookFilters) {
    try {
        const books = await getBooksDb(filters)
        return { success: true, data: books }
    } catch (error) {
        console.error('Error fetching books:', error)
        return { success: false, error: 'Failed to fetch books', data: [] }
    }
}

/**
 * Supprimer plusieurs livres en masse
 */
export async function bulkDeleteBooks(ids: string[]) {
    try {
        await verifyAdmin()
        await prisma.book.deleteMany({
            where: { id: { in: ids } },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'BULK_DELETE',
            entity: 'BOOK',
            details: `${ids.length} livres supprimés`,
        })

        return { success: true }
    } catch (error: any) {
        console.error('Erreur lors de la suppression en masse:', error)
        return { success: false, error: 'Impossible de supprimer les livres sélectionnés' }
    }
}

/**
 * Récupérer tous les livres actifs pour le catalogue PDF
 */
export async function getAllBooksForCatalog() {
    try {
        await verifyAdmin()
        const books = await prisma.book.findMany({
            where: { active: true, stock: { gt: 0 } },
            orderBy: { title: 'asc' },
            select: {
                id: true,
                title: true,
                author: true,
                price: true,
                image: true,
                description: true,
                category: true,
                language: true,
            }
        })

        return {
            success: true,
            data: books
        }
    } catch (error: any) {
        console.error('Erreur lors de la récupération des livres pour le catalogue:', error)
        return {
            success: false,
            error: 'Impossible de récupérer les livres'
        }
    }
}

/**
 * Vider toute la bibliothèque (Supprimer tous les livres)
 */
export async function deleteAllBooks(): Promise<BookResult> {
    try {
        await verifyAdmin()
        await prisma.book.deleteMany({})

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'DELETE_ALL',
            entity: 'BOOK',
            details: 'Toute la bibliothèque a été supprimée'
        })

        return { success: true, bookId: 'all' }
    } catch (error: any) {
        console.error('Erreur lors de la suppression de tous les livres:', error)
        return { success: false, error: 'Impossible de vider la bibliothèque' }
    }
}

/**
 * Mettre à jour l'ordre d'affichage des livres
 */
export async function updateBookOrder(orderedIds: string[], pageOffset: number = 0) {
    try {
        await verifyAdmin()
        
        const MANUAL_ORDER_BASE = -1000000
        // Mise à jour groupée de l'ordre avec une base négative pour passer devant le par défaut (0)
        await prisma.$transaction(
            orderedIds.map((id, index) => 
                prisma.book.update({
                    where: { id },
                    data: { displayOrder: MANUAL_ORDER_BASE + pageOffset + index }
                })
            )
        )

        revalidatePath('/admin/books')
        revalidatePath('/')
        
        return { success: true }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour de l\'ordre:', error)
        return { success: false, error: 'Impossible de mettre à jour l\'ordre' }
    }
}
/**
 * Mettre à jour les prix en masse
 */
export async function bulkUpdateBookPrices(ids: string[], newPrice: number) {
    try {
        await verifyAdmin()
        await prisma.book.updateMany({
            where: { id: { in: ids } },
            data: { price: Number(newPrice) },
        })

        revalidatePath('/admin/books')
        revalidatePath('/')

        await createAuditLog({
            action: 'BULK_UPDATE_PRICE',
            entity: 'BOOK',
            details: `Prix mis à jour pour ${ids.length} livres: ${newPrice} MAD`,
        })

        return { success: true }
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour des prix en masse:', error)
        return { success: false, error: 'Impossible de mettre à jour les prix' }
    }
}
