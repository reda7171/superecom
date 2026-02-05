import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Nettoyage avec gestion d'erreur souple
        await prisma.orderItem.deleteMany().catch(e => console.error(e))
        await prisma.order.deleteMany().catch(e => console.error(e))
        await prisma.packBook.deleteMany().catch(e => console.error(e))
        await prisma.pack.deleteMany().catch(e => console.error(e))
        await prisma.book.deleteMany().catch(e => console.error(e))
        await prisma.user.deleteMany().catch(e => console.error(e))

        return NextResponse.json({ success: true, message: 'Cleaned!' })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
