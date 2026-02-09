'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function uploadBookImage(formData: FormData) {
    try {
        const file = formData.get('image') as File

        if (!file) {
            return { success: false, error: "Aucune image fournie" }
        }

        // Vérifier le type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Format d'image non supporté. Utilisez JPG, PNG ou WebP" }
        }

        // Vérifier la taille (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return { success: false, error: "L'image est trop volumineuse. Maximum 5MB" }
        }

        // Créer le dossier uploads s'il n'existe pas
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'books')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = file.name.split('.').pop()
        const filename = `book_${timestamp}_${randomString}.${extension}`

        // Convertir le fichier en buffer et sauvegarder
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Retourner le chemin relatif pour la base de données
        const imageUrl = `/uploads/books/${filename}`

        return { success: true, imageUrl }
    } catch (error: any) {
        console.error('Upload error:', error)
        return { success: false, error: "Erreur lors de l'upload de l'image" }
    }
}

// Fonction pour supprimer une image
export async function deleteBookImage(imageUrl: string) {
    try {
        if (!imageUrl || !imageUrl.startsWith('/uploads/books/')) {
            return { success: false, error: "URL d'image invalide" }
        }

        const { unlink } = await import('fs/promises')
        const filepath = join(process.cwd(), 'public', imageUrl)

        if (existsSync(filepath)) {
            await unlink(filepath)
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression de l'image" }
    }
}
