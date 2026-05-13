import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

// GET: Liste des produits numériques actifs
export async function GET(req: NextRequest) {
  try {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`digital_products_${ip}`, { limit: 100, windowMs: 60000 })
    if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { active: true }
    if (category) where.category = category
    if (featured === 'true') where.featured = true

    const products = await prisma.digitalProduct.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        category: true,
        language: true,
        pages: true,
        fileSize: true,
        featured: true,
        downloadCount: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching digital products:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
