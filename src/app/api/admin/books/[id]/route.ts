import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await verifyAdmin()

        const { id } = await params

        const book = await prisma.book.findUnique({
            where: { id }
        })

        if (!book) {
            return NextResponse.json({ success: false, error: 'Livre non trouvé' }, { status: 404 })
        }

        return NextResponse.json({ success: true, book })
    } catch (error: any) {
        console.error('Erreur API admin/books/[id]:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
