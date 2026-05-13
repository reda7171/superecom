import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/actions/auth'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

// POST: Créer un produit numérique
export async function POST(req: NextRequest) {
  try {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`admin_digital_products_post_${ip}`, { limit: 20, windowMs: 60000 })
    if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    await verifyAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, author, description, price, originalPrice, image, pdfUrl, category, language, pages, fileSize, active, featured } = body

    if (!title || !author || !description || !price || !image || !pdfUrl) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const product = await prisma.digitalProduct.create({
      data: {
        title,
        author,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image,
        pdfUrl,
        category: category || null,
        language: language || 'fr',
        pages: pages ? parseInt(pages) : null,
        fileSize: fileSize || null,
        active: active !== false,
        featured: featured || false,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating digital product:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET: Liste admin (avec produits inactifs)
export async function GET(req: NextRequest) {
  try {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`admin_digital_products_get_${ip}`, { limit: 50, windowMs: 60000 })
    if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    await verifyAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const products = await prisma.digitalProduct.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products })
}
