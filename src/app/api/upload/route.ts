import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { verifyAdmin } from '@/lib/actions/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeFilename } from '@/lib/security'
import { createHash } from 'crypto'
import sharp from 'sharp'

// Liste blanche des types MIME autorisés
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
]

// Extensions autorisées
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif']

// Taille max : 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
    try {
        // OWASP A01: Broken Access Control - Vérifier authentification admin
        try {
            await verifyAdmin()
        } catch {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // OWASP A04: Rate Limiting
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`upload_${ip}`, { limit: 10, windowMs: 60000 })

        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too many upload requests. Please try again later.' },
                { status: 429 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // OWASP A03: Injection - Validation stricte du type MIME
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            console.error('[UPLOAD] Invalid MIME type:', file.type)
            return NextResponse.json(
                { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` },
                { status: 400 }
            )
        }

        // Vérifier l'extension du fichier
        const fileExtension = path.extname(file.name).toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            console.error('[UPLOAD] Invalid extension:', fileExtension)
            return NextResponse.json(
                { error: `Invalid file extension: ${fileExtension}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            )
        }

        // Vérifier la taille
        if (file.size > MAX_FILE_SIZE) {
            console.error('[UPLOAD] File too large:', file.size)
            return NextResponse.json(
                { error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // OWASP A08: Vérifier les magic bytes (signature du fichier)
        const magicBytes = buffer.slice(0, 4).toString('hex')
        const validSignatures: Record<string, string[]> = {
            'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
            'image/png': ['89504e47'],
            'image/gif': ['47494638'],
            'image/webp': ['52494646']
        }

        const expectedSignatures = validSignatures[file.type]
        if (expectedSignatures && !expectedSignatures.some(sig => magicBytes.startsWith(sig))) {
            console.error('[UPLOAD] Magic bytes mismatch for', file.type, ':', magicBytes)
            return NextResponse.json(
                { error: 'File content does not match declared type (Magic Bytes Mismatch)' },
                { status: 400 }
            )
        }

        // --- OPTIMISATION SHARP ---
        // On convertit tout en JPEG pour la compatibilité maximale (notamment Instagram)
        let processedBuffer: Buffer
        try {
            processedBuffer = await sharp(buffer)
                .jpeg({ quality: 85, mozjpeg: true }) // Excellente compatibilité et compression
                .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
                .toBuffer()
        } catch (sharpError) {
            console.error('[UPLOAD] Sharp processing failed:', sharpError)
            // Fallback sur le buffer original si sharp échoue
            processedBuffer = buffer
        }

        // OWASP A03: Sanitize filename pour éviter path traversal
        const baseName = path.basename(file.name, fileExtension)
        const sanitizedName = sanitizeFilename(baseName)

        // Gestion spécifique Marketing
        const isMarketing = formData.get('type') === 'marketing'
        const marketingType = formData.get('marketingType') as string || 'CREATIVE'
        const customName = formData.get('customName') as string

        // Générer un hash unique pour éviter les collisions
        const hash = createHash('sha256')
            .update(processedBuffer)
            .update(Date.now().toString())
            .digest('hex')
            .substring(0, 16)

        // Nom du fichier
        let fileName = `${hash}-${sanitizedName}.jpg`
        if (isMarketing) {
            const prefix = marketingType === 'PACK' ? 'pack_' : marketingType === 'DESCRIPTION' ? 'desc_' : 'creative_'
            const finalName = customName ? sanitizeFilename(customName) : sanitizedName
            fileName = `${prefix}${hash}_${finalName}.jpg`
        }

        // Créer le répertoire s'il n'existe pas
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books')
        await mkdir(uploadDir, { recursive: true })

        // Vérifier que le chemin final est bien dans le répertoire autorisé (anti path traversal)
        const filePath = path.join(uploadDir, fileName)
        const normalizedPath = path.normalize(filePath)

        if (!normalizedPath.startsWith(uploadDir)) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            )
        }

        // Sauvegarder le fichier optimisé
        await writeFile(normalizedPath, processedBuffer)

        // Retourner l'URL publique
        const url = `/uploads/books/${fileName}`

        // Si c'est du marketing, on enregistre en base
        if (isMarketing) {
            try {
                await prisma.marketingAsset.create({
                    data: {
                        name: fileName,
                        url: url,
                        type: marketingType,
                    }
                })
            } catch (dbError) {
                console.error('[UPLOAD] DB sync failed:', dbError)
                // On continue quand même car le fichier est écrit
            }
        }

        return NextResponse.json({ success: true, url })
    } catch (error: any) {
        console.error('[UPLOAD ERROR]', error.message)

        // Ne pas exposer les détails de l'erreur en production
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        )
    }
}
