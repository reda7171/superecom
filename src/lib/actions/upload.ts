'use server'

import { writeFile, mkdir, unlink } from 'fs/promises'
import { join, normalize, extname } from 'path'
import { existsSync } from 'fs'
import { verifyAdmin } from './auth'
import { sanitizeFilename } from '@/lib/security'
import { createHash } from 'crypto'

// Liste blanche des types MIME et signatures (magic bytes) autorisés
const ALLOWED_FILES: Record<string, string[]> = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
    'image/png': ['89504e47'],
    'image/gif': ['47494638'],
    'image/webp': ['52494646']
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

import sharp from 'sharp'

/**
 * Helper sécurisé pour l'upload de fichiers
 * OWASP: Validation du type (MIME + Magic Bytes), Taille, et Nom de fichier
 */
async function handleSecureUpload(file: File, subDir: string, prefix: string) {
    if (!file) {
        throw new Error("Aucun fichier fourni")
    }

    // 1. Vérification du type MIME
    if (!Object.keys(ALLOWED_FILES).includes(file.type)) {
        throw new Error(`Format non supporté: ${file.type}. Utilisez JPG, PNG, WebP ou GIF.`)
    }

    // 2. Vérification de la taille
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Le fichier est trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum 5MB.`)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 3. Vérification des Magic Bytes (Signature réelle du fichier)
    const magicBytes = buffer.slice(0, 4).toString('hex')
    const expectedSignatures = ALLOWED_FILES[file.type]
    if (expectedSignatures && !expectedSignatures.some(sig => magicBytes.startsWith(sig))) {
        throw new Error("Le contenu du fichier ne correspond pas à son extension (Signature invalide)")
    }

    // --- OPTIMISATION SHARP ---
    let processedBuffer: Buffer
    try {
        processedBuffer = await sharp(buffer)
            .jpeg({ quality: 85, mozjpeg: true })
            .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
            .toBuffer()
    } catch (sharpError) {
        console.error('[UPLOAD ACTION] Sharp failed:', sharpError)
        processedBuffer = buffer
    }

    // 4. Sanitize Filename & Génération nom unique
    const baseName = sanitizeFilename(file.name).split('.')[0]
    const hash = createHash('sha256').update(processedBuffer).update(Date.now().toString()).digest('hex').substring(0, 12)
    
    // On force l'extension .jpg pour toutes les images (compatibilité Instagram)
    const filename = `${prefix}_${hash}_${baseName}.jpg`

    // 5. Préparation du chemin
    const uploadDir = join(process.cwd(), 'public', 'uploads', subDir)
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
    }

    const filepath = normalize(join(uploadDir, filename))
    
    // Anti-Path Traversal check
    if (!filepath.startsWith(uploadDir)) {
        throw new Error("Chemin de fichier invalide")
    }

    // 6. Sauvegarde
    await writeFile(filepath, processedBuffer)

    return `/uploads/${subDir}/${filename}`
}

export async function uploadBookImage(formData: FormData) {
    try {
        await verifyAdmin()
        const file = formData.get('image') as File
        const imageUrl = await handleSecureUpload(file, 'products', 'product')
        return { success: true, imageUrl }
    } catch (error: any) {
        console.error('[UPLOAD ERROR]', error.message)
        return { success: false, error: error.message || "Erreur lors de l'upload" }
    }
}

export async function uploadPostImage(formData: FormData) {
    try {
        await verifyAdmin()
        const file = formData.get('image') as File
        const imageUrl = await handleSecureUpload(file, 'posts', 'post')
        return { success: true, imageUrl }
    } catch (error: any) {
        console.error('[UPLOAD ERROR]', error.message)
        return { success: false, error: error.message || "Erreur lors de l'upload" }
    }
}

export async function uploadGiftImage(formData: FormData) {
    try {
        await verifyAdmin()
        const file = formData.get('image') as File
        const imageUrl = await handleSecureUpload(file, 'gifts', 'gift')
        return { success: true, imageUrl }
    } catch (error: any) {
        console.error('[UPLOAD ERROR]', error.message)
        return { success: false, error: error.message || "Erreur lors de l'upload" }
    }
}

export async function uploadAuthorImage(formData: FormData) {
    try {
        await verifyAdmin()
        const file = formData.get('image') as File
        const imageUrl = await handleSecureUpload(file, 'authors', 'author')
        return { success: true, imageUrl }
    } catch (error: any) {
        console.error('[UPLOAD ERROR]', error.message)
        return { success: false, error: error.message || "Erreur lors de l'upload" }
    }
}

/**
 * Suppression sécurisée avec vérification de chemin
 */
export async function deleteBookImage(imageUrl: string) {
    try {
        await verifyAdmin()

        if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
            return { success: false, error: "URL d'image invalide" }
        }

        const publicDir = join(process.cwd(), 'public')
        const filepath = normalize(join(publicDir, imageUrl))

        // Empêcher la suppression hors du dossier public/uploads
        if (!filepath.startsWith(join(publicDir, 'uploads'))) {
            return { success: false, error: "Tentative de suppression non autorisée" }
        }

        if (existsSync(filepath)) {
            await unlink(filepath)
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la suppression" }
    }
}
