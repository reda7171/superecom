import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

export async function GET(request: NextRequest) {
    try {
        await verifyAdmin()
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        const accessories = await prisma.extraProduct.findMany({
            where: category ? { category: category.toUpperCase() } : undefined,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(accessories)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await verifyAdmin()
        const data = await request.json()

        const accessory = await prisma.extraProduct.create({
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                costPrice: parseFloat(data.costPrice || 0),
                stock: parseInt(data.stock || 0),
                image: data.image,
                category: data.category || 'ACCESSORY',
                active: data.active !== undefined ? data.active : true
            }
        })

        return NextResponse.json(accessory)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
