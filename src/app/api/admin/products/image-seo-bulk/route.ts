import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

// Bulk update alt/title pour tous les livres
export async function POST(req: Request) {
    try {
        await verifyAdmin()
        const { edits } = await req.json() as { edits: Record<string, { alt: string; title: string }> }

        await prisma.$transaction(
            Object.entries(edits).map(([id, { alt, title }]) =>
                prisma.product.update({
                    where: { id },
                    data: { imageAlt: alt || null, imageTitle: title || null }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
