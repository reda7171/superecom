'use server'

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'

const ProfileSchema = z.object({
    fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    city: z.string().min(2, 'La ville est requise'),
    address: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
})

export async function updateProfile(formData: FormData) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: 'Non authentifié' }

    const imageEntry = formData.get('image')
    let imageUrl: string | undefined

    // Handle File Upload
    if (imageEntry instanceof File) {
        if (imageEntry.size > 0) {
            try {
                const file = imageEntry
                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)

                // Simple validation
                if (file.size > 5 * 1024 * 1024) {
                    return { success: false, error: 'L\'image est trop volumineuse (max 5MB)' }
                }

                const mimeType = file.type
                if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
                    return { success: false, error: 'Format d\'image non supporté' }
                }

                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
                await mkdir(uploadDir, { recursive: true })

                const ext = path.extname(file.name) || '.jpg'
                const fileName = `${randomUUID()}${ext}`
                const filePath = path.join(uploadDir, fileName)

                await writeFile(filePath, buffer)
                imageUrl = `/uploads/profiles/${fileName}`
            } catch (err) {
                console.error('Upload Error:', err)
                return { success: false, error: 'Erreur lors du téléchargement de l\'image' }
            }
        }
    } else if (typeof imageEntry === 'string' && imageEntry.length > 0) {
        imageUrl = imageEntry
    }

    const data = {
        fullName: formData.get('fullName'),
        city: formData.get('city'),
        address: formData.get('address'),
        neighborhood: formData.get('neighborhood'),
        image: imageUrl, // Use the processed URL or undefined to keep existing
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
                address: validated.data.address,
                neighborhood: validated.data.neighborhood,
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
