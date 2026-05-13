import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

// PUT: Mettre à jour un produit
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`admin_digital_product_put_${ip}`, { limit: 20, windowMs: 60000 })
    if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    await verifyAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await req.json()
    const product = await prisma.digitalProduct.update({
      where: { id },
      data: {
        title: body.title,
        author: body.author,
        description: body.description,
        price: body.price != null ? parseFloat(body.price) : undefined,
        originalPrice: body.originalPrice != null ? parseFloat(body.originalPrice) : null,
        image: body.image,
        pdfUrl: body.pdfUrl,
        category: body.category || null,
        language: body.language,
        pages: body.pages != null ? parseInt(body.pages) : null,
        fileSize: body.fileSize || null,
        active: body.active,
        featured: body.featured,
      },
    })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH: Toggle actif/vedette
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`admin_digital_product_patch_${ip}`, { limit: 20, windowMs: 60000 })
    if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    await verifyAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await req.json()
    const product = await prisma.digitalProduct.update({
      where: { id },
      data: body,
    })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer un produit
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`admin_digital_product_delete_${ip}`, { limit: 10, windowMs: 60000 })
    if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    await verifyAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.digitalProduct.delete({ where: { id } })
    return NextResponse.json({ message: 'Supprimé' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
