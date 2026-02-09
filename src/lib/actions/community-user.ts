'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'

const ProfileSchema = z.object({
    fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    city: z.string().min(2, 'La ville est requise'),
    image: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
})

export async function updateProfile(formData: FormData) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: 'Non authentifié' }

    const data = {
        fullName: formData.get('fullName'),
        city: formData.get('city'),
        image: formData.get('image'),
        bio: formData.get('bio'),
        instagram: formData.get('instagram'),
        facebook: formData.get('facebook'),
        twitter: formData.get('twitter'),
    }

    const validated = ProfileSchema.safeParse(data)

    if (!validated.success) {
        return { success: false, error: validated.error.errors[0].message }
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                fullName: validated.data.fullName,
                city: validated.data.city,
                image: validated.data.image,
                bio: validated.data.bio,
                instagram: validated.data.instagram,
                facebook: validated.data.facebook,
                twitter: validated.data.twitter,
            },
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Une erreur est survenue lors de la mise à jour' }
    }
}
