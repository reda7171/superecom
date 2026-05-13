import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/security'

export async function POST(req: Request) {
    try {
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`abandoned_cart_post_${ip}`, { limit: 20, windowMs: 60000 })
        if (!limiter.success) return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 })

        const body = await req.json()
        const { id, phone, email, fullName, items, total } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ success: true }) // Pas d'abandon si panier vide
        }

        // OWASP: Validation et sanitization
        const safeFullName = fullName ? sanitizeInput(fullName as string) : ''
        const safePhone = phone ? sanitizeInput(phone as string) : null
        const safeEmail = email ? sanitizeInput(email as string) : null

        const cartData = JSON.stringify(items)

        // Si ID fourni, on met à jour
        if (id) {
            const existing = await prisma.abandonedCart.findUnique({ where: { id } })
            if (existing) {
                const updated = await prisma.abandonedCart.update({
                    where: { id },
                    data: { phone: safePhone, email: safeEmail, fullName: safeFullName, cartData, total, status: 'PENDING' }
                })
                return NextResponse.json({ success: true, id: updated.id })
            }
        }

        // Sinon on crée un nouveau "panier abandonné" en attente
        const newCart = await prisma.abandonedCart.create({
            data: {
                phone: safePhone,
                email: safeEmail,
                fullName: safeFullName,
                cartData,
                total,
                status: 'PENDING'
            }
        })

        return NextResponse.json({ success: true, id: newCart.id })

    } catch (e: any) {
        console.error('Erreur cart abandon:', e)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`abandoned_cart_delete_${ip}`, { limit: 20, windowMs: 60000 })
        if (!limiter.success) return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 })

        const body = await req.json()
        const { id } = body

        if (id) {
            await prisma.abandonedCart.delete({ where: { id } })
        }
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false })
    }
}

