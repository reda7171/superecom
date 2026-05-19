import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await verifyAdmin()
        const { id } = await params
        const accessory = await prisma.extraProduct.findUnique({
            where: { id }
        })
        if (!accessory) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(accessory)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await verifyAdmin()
        const { id } = await params
        const data = await request.json()

        const accessory = await prisma.extraProduct.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price !== undefined ? parseFloat(data.price) : undefined,
                costPrice: data.costPrice !== undefined ? parseFloat(data.costPrice) : undefined,
                stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
                image: data.image,
                category: data.category,
                materials: data.materials,
                dimensions: data.dimensions,
                weight: data.weight,
                warranty: data.warranty,
                active: data.active
            }
        })

        return NextResponse.json(accessory)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await verifyAdmin()
        const { id } = await params
        await prisma.extraProduct.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
