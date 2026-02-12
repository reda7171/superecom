import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
        }

        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const originalName = file.name.replace(/\s+/g, '-').toLowerCase()
        const fileName = `${timestamp}-${originalName}`

        // Chemin de sauvegarde
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books')
        const filePath = path.join(uploadDir, fileName)

        // Sauvegarder le fichier
        await writeFile(filePath, buffer)

        // Retourner l'URL publique
        const url = `/uploads/books/${fileName}`

        return NextResponse.json({ success: true, url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
