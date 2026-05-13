import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { phone, items, total } = body

        if (!phone || !items || !total) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
        }

        const recentCart = await prisma.abandonedCart.findFirst({
            where: {
                phone,
                status: 'PENDING',
                updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24h
            }
        })

        if (recentCart) {
            await prisma.abandonedCart.update({
                where: { id: recentCart.id },
                data: {
                    cartData: JSON.stringify(items),
                    total
                }
            })
        } else {
            await prisma.abandonedCart.create({
                data: {
                    phone,
                    cartData: JSON.stringify(items),
                    total
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erreur cart abandoned:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
