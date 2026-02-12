'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { verifyAdmin } from './auth'

export async function uploadBookImage(formData: FormData) {
    try {
        await verifyAdmin() // OWASP A01: Broken Access Control

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

        // Sécurisation de l'extension (ne pas faire confiance au file.name)
        const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
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
        return { success: false, error: error.message || "Erreur lors de l'upload de l'image" }
    }
}

// Fonction pour supprimer une image
export async function deleteBookImage(imageUrl: string) {
    try {
        await verifyAdmin() // OWASP A01: Broken Access Control

        if (!imageUrl || (!imageUrl.startsWith('/uploads/books/') && !imageUrl.startsWith('/uploads/posts/'))) {
            return { success: false, error: "URL d'image invalide" }
        }

        const { unlink } = await import('fs/promises')
        const filepath = join(process.cwd(), 'public', imageUrl)

        if (existsSync(filepath)) {
            await unlink(filepath)
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la suppression de l'image" }
    }
}

export async function uploadPostImage(formData: FormData) {
    try {
        await verifyAdmin()

        const file = formData.get('image') as File

        if (!file) {
            return { success: false, error: "Aucune image fournie" }
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Format d'image non supporté. Utilisez JPG, PNG ou WebP" }
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return { success: false, error: "L'image est trop volumineuse. Maximum 5MB" }
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'posts')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
        const filename = `post_${timestamp}_${randomString}.${extension}`

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        const imageUrl = `/uploads/posts/${filename}`

        return { success: true, imageUrl }
    } catch (error: any) {
        console.error('Upload error:', error)
        return { success: false, error: error.message || "Erreur lors de l'upload de l'image" }
    }
}
