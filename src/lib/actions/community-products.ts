'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser, checkExchangeEligibility } from '@/lib/actions/community-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BookSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    author: z.string().min(1, 'L\'auteur est requis'),
    condition: z.enum(['NEW', 'GOOD', 'USED']),
    description: z.string().optional(),
    isbn: z.string().optional(),
    image: z.string().optional(),
})

export type BookResult =
    | { success: true; productId: string }
    | { success: false; error: string }

export async function addExchangeBook(formData: FormData): Promise<BookResult> {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Vous devez être connecté" }

    // Vérifier l'éligibilité
    const isEligible = await checkExchangeEligibility(user)
    if (!isEligible) {
        return { success: false, error: "Vous devez avoir effectué au moins une commande sur SuperEcom pour accéder au système d'échange." }
    }

    const rawData = {
        title: formData.get('title'),
        author: formData.get('author'),
        condition: formData.get('condition'),
        description: formData.get('description'),
        isbn: formData.get('isbn'),
        image: formData.get('image'),
    }

    try {
        const data = BookSchema.parse(rawData)

        // Vérifier doublon (même titre/auteur pour cet utilisateur)
        const existing = await prisma.exchangeProduct.findFirst({
            where: {
                ownerId: user.id,
                title: data.title,
                author: data.author,
                status: 'AVAILABLE'
            }
        })

        if (existing) {
            return { success: false, error: "Vous avez déjà ce livre listé comme disponible." }
        }

        const product = await prisma.exchangeProduct.create({
            data: {
                ownerId: user.id,
                title: data.title,
                author: data.author,
                condition: data.condition as any,
                description: data.description || '',
                isbn: data.isbn || null,
                image: data.image || null,
                status: 'AVAILABLE',
            }
        })

        revalidatePath('/community')
        return { success: true, productId: product.id }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: "Erreur lors de l'ajout du livre" }
    }
}

export async function getExchangeBook(id: string) {
    const user = await getCommunityUser()
    if (!user) return null

    const product = await prisma.exchangeProduct.findUnique({
        where: { id }
    })

    if (!product || product.ownerId !== user.id) return null

    return product
}

export async function updateExchangeBook(id: string, formData: FormData): Promise<BookResult> {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Vous devez être connecté" }

    const rawData = {
        title: formData.get('title'),
        author: formData.get('author'),
        condition: formData.get('condition'),
        description: formData.get('description'),
        isbn: formData.get('isbn'),
        image: formData.get('image'),
        status: formData.get('status'),
    }

    try {
        const data = BookSchema.parse(rawData)

        // Vérifier propriété du livre
        const existingBook = await prisma.exchangeProduct.findUnique({
            where: { id }
        })

        if (!existingBook || existingBook.ownerId !== user.id) {
            return { success: false, error: "Livre introuvable ou vous n'êtes pas propriétaire" }
        }

        const updateData: any = {
            title: data.title,
            author: data.author,
            condition: data.condition as any,
            description: data.description || '',
            isbn: data.isbn || null,
        }

        if (data.image) {
            updateData.image = data.image
        }

        if (rawData.status) {
            updateData.status = rawData.status
        }

        await prisma.exchangeProduct.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/community')
        revalidatePath(`/community/products/${id}`)
        return { success: true, productId: id }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: "Erreur lors de la mise à jour du livre" }
    }
}

export async function deleteExchangeBook(id: string): Promise<BookResult> {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Vous devez être connecté" }

    try {
        const existingBook = await prisma.exchangeProduct.findUnique({
            where: { id }
        })

        if (!existingBook || existingBook.ownerId !== user.id) {
            return { success: false, error: "Livre introuvable ou vous n'êtes pas propriétaire" }
        }

        // Vérifier s'il est utilisé dans des échanges PENDING
        const pendingExchanges = await prisma.exchange.findFirst({
            where: {
                OR: [
                    { productRequestedId: id },
                    { productOfferedId: id }
                ],
                status: {
                    in: ['PENDING', 'ACCEPTED']
                }
            }
        })

        if (pendingExchanges) {
            return { success: false, error: "Impossible de supprimer ce livre car il est engagé dans un échange en cours" }
        }

        await prisma.exchangeProduct.delete({
            where: { id }
        })

        revalidatePath('/community')
        return { success: true, productId: id }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression du livre" }
    }
}
