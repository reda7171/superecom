'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from '@/lib/actions/community-auth'
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
    | { success: true; bookId: string }
    | { success: false; error: string }

export async function addExchangeBook(formData: FormData): Promise<BookResult> {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Vous devez être connecté" }

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

        const book = await prisma.exchangeBook.create({
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
        return { success: true, bookId: book.id }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: "Erreur lors de l'ajout du livre" }
    }
}
