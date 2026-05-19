import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { verifyAdmin } from '@/lib/actions/auth'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeFilename } from '@/lib/security'
import { createHash } from 'crypto'

// Types MIME autorisés (images uniquement)
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
]

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']

// Max 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
    try {
        // Authentification admin
        try {
            await verifyAdmin()
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Rate limiting
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`upload_img_${ip}`, { limit: 20, windowMs: 60000 })
        if (!limiter.success) {
            return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })

        // Validation MIME
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, AVIF.' }, { status: 400 })
        }

        // Validation extension
        const ext = path.extname(file.name).toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json({ error: `Extension non autorisée : ${ext}` }, { status: 400 })
        }

        // Validation taille
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: `Fichier trop volumineux. Max 10MB.` }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Vérification magic bytes (JPEG: FF D8, PNG: 89 50, WebP: RIFF)
        const sig = buffer.slice(0, 4)
        const isJpeg = sig[0] === 0xFF && sig[1] === 0xD8
        const isPng = sig[0] === 0x89 && sig[1] === 0x50
        const isWebP = sig.toString('ascii', 0, 4) === 'RIFF'
        const isGif = sig.toString('ascii', 0, 3) === 'GIF'
        if (!isJpeg && !isPng && !isWebP && !isGif) {
            return NextResponse.json({ error: 'Contenu de fichier invalide.' }, { status: 400 })
        }

        // Nom de fichier sécurisé + hash unique
        const sanitized = sanitizeFilename(file.name)
        const hash = createHash('sha256')
            .update(buffer)
            .update(Date.now().toString())
            .digest('hex')
            .substring(0, 12)

        const fileName = `${hash}-${sanitized}`

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
        await mkdir(uploadDir, { recursive: true })

        const filePath = path.join(uploadDir, fileName)
        const normalized = path.normalize(filePath)
        if (!normalized.startsWith(uploadDir)) {
            return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })
        }

        await writeFile(normalized, buffer)

        const url = `/uploads/images/${fileName}`
        return NextResponse.json({ success: true, url })
    } catch (error: any) {
        console.error('[IMG UPLOAD ERROR]', error.message)
        return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
    }
}
