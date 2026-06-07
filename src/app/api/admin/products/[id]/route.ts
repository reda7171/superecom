import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await verifyAdmin()

        const { id } = await params

        const product = await prisma.product.findUnique({
            where: { id }
        })

        if (!product) {
            return NextResponse.json({ success: false, error: 'Livre non trouvé' }, { status: 404 })
        }

        return NextResponse.json({ success: true, product })
    } catch (error: any) {
        console.error('Erreur API admin/products/[id]:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
