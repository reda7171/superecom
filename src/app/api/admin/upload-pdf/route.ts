import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { verifyAdmin } from '@/lib/actions/auth'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeFilename } from '@/lib/security'
import { createHash } from 'crypto'

// Liste blanche des types MIME autorisés pour les PDF
const ALLOWED_MIME_TYPES = [
    'application/pdf'
]

// Extensions autorisées
const ALLOWED_EXTENSIONS = ['.pdf']

// Taille max : 50MB pour les PDF
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
    try {
        // Authentification admin
        try {
            await verifyAdmin()
        } catch {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Rate Limiting
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`upload_pdf_${ip}`, { limit: 5, windowMs: 60000 })

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

        // Validation du type MIME
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Seuls les fichiers PDF sont autorisés.' },
                { status: 400 }
            )
        }

        // Vérifier l'extension
        const fileExtension = path.extname(file.name).toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            return NextResponse.json(
                { error: 'L\'extension du fichier doit être .pdf' },
                { status: 400 }
            )
        }

        // Vérifier la taille
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Le fichier est trop volumineux. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Vérifier magic bytes pour PDF (%PDF-)
        const magicBytes = buffer.slice(0, 4).toString('ascii')
        if (magicBytes !== '%PDF') {
            return NextResponse.json(
                { error: 'Le contenu du fichier n\'est pas un PDF valide.' },
                { status: 400 }
            )
        }

        // Sanitize filename
        const sanitizedName = sanitizeFilename(file.name)

        // Générer un hash unique
        const hash = createHash('sha256')
            .update(buffer)
            .update(Date.now().toString())
            .digest('hex')
            .substring(0, 16)

        const fileName = `${hash}-${sanitizedName}`

        // Créer le répertoire s'il n'existe pas (stockage sécurisé dans public/uploads/digital)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'digital')
        await mkdir(uploadDir, { recursive: true })

        const filePath = path.join(uploadDir, fileName)
        const normalizedPath = path.normalize(filePath)

        if (!normalizedPath.startsWith(uploadDir)) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            )
        }

        // Sauvegarder le fichier
        await writeFile(normalizedPath, buffer)

        // Retourner l'URL publique
        const url = `/uploads/digital/${fileName}`

        return NextResponse.json({ success: true, url, size: file.size })
    } catch (error: any) {
        console.error('[PDF UPLOAD ERROR]', error.message)
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload du PDF' },
            { status: 500 }
        )
    }
}
