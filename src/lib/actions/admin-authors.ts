'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/actions/auth'
import { createAuditLog } from './audit'

const AuthorProfileSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    bio: z.string().optional(),
    image: z.string().optional(),
    nationality: z.string().optional(),
    birthYear: z.number().optional().nullable(),
})

export type AuthorProfileInput = z.infer<typeof AuthorProfileSchema>

/**
 * Récupère tous les auteurs uniques et leurs profils
 */
export async function getAllAuthors() {
    try {
        await verifyAdmin()

        // 1. Récupérer tous les auteurs uniques des livres
        const uniqueAuthors = await prisma.book.groupBy({
            by: ['author'],
            _count: {
                _all: true
            }
        })

        // 2. Récupérer tous les profils existants
        const profiles = await prisma.authorProfile.findMany()

        // 3. Fusionner les données
        const authors = uniqueAuthors.map(item => {
            const profile = profiles.find(p => p.name === item.author)
            return {
                name: item.author,
                bookCount: item._count._all,
                bio: profile?.bio || null,
                image: profile?.image || null,
                nationality: profile?.nationality || null,
                birthYear: profile?.birthYear || null,
                hasProfile: !!profile
            }
        })

        return { success: true, data: authors.sort((a, b) => b.bookCount - a.bookCount) }
    } catch (error: any) {
        console.error('Erreur getAllAuthors:', error)
        return { success: false, error: 'Erreur lors de la récupération des auteurs', data: [] }
    }
}

/**
 * Créer ou mettre à jour un profil d'auteur
 */
export async function upsertAuthorProfile(input: AuthorProfileInput) {
    try {
        await verifyAdmin()
        const validatedData = AuthorProfileSchema.parse(input)

        const profile = await prisma.authorProfile.upsert({
            where: { name: validatedData.name },
            update: {
                bio: validatedData.bio,
                image: validatedData.image,
                nationality: validatedData.nationality,
                birthYear: validatedData.birthYear,
            },
            create: {
                name: validatedData.name,
                bio: validatedData.bio,
                image: validatedData.image,
                nationality: validatedData.nationality,
                birthYear: validatedData.birthYear,
            }
        })

        revalidatePath('/admin/authors')
        revalidatePath(`/authors/${encodeURIComponent(validatedData.name)}`)
        revalidatePath('/')

        await createAuditLog({
            action: 'UPSERT',
            entity: 'AUTHOR_PROFILE',
            entityId: profile.id,
            details: `Profil auteur mis à jour: ${validatedData.name}`
        })

        return { success: true }
    } catch (error: any) {
        console.error('Erreur upsertAuthorProfile:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: 'Erreur lors de la sauvegarde du profil' }
    }
}
