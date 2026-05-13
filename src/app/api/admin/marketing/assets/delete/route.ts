import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/actions/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(req: NextRequest) {
    try {
        await verifyAdmin()

        const { filename } = await req.json()
        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
        }

        // Sécurité: Empêcher le path traversal
        const safeFilename = path.basename(filename)
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'books', safeFilename)

        try {
            // Supprimer du système de fichiers
            await fs.unlink(filePath)
        } catch (e) {
            console.warn(`File ${safeFilename} not found on disk, continuing to DB deletion`)
        }

        // Supprimer de la base de données
        try {
            await prisma.marketingAsset.delete({
                where: { name: safeFilename }
            })
        } catch (e) {
            console.warn(`Asset ${safeFilename} not found in DB`)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
