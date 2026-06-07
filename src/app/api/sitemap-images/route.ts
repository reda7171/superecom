import { NextRequest, NextResponse } from 'next/server'

// API pour générer un sitemap dynamique des images
export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://superEcom.store'

    // Récupérer les images depuis la base de données
    const { prisma } = await import('@/lib/prisma')

    const [products, packs] = await Promise.all([
        prisma.product.findMany({
            where: { active: true },
            select: { id: true, image: true, title: true, updatedAt: true },
        }),
        prisma.pack.findMany({
            include: {
                products: {
                    select: {
                        product: {
                            select: { image: true }
                        }
                    }
                }
            }
        }),
    ])

    const bookImages = products.map((product) => ({
        loc: product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`,
        title: product.title,
        caption: product.title,
        lastmod: product.updatedAt?.toISOString() || new Date().toISOString(),
    }))

    const packImages = packs.map((pack) => ({
        loc: pack.image?.startsWith('http')
            ? pack.image
            : pack.products[0]?.product.image
                ? `${baseUrl}${pack.products[0].product.image}`
                : '',
        title: pack.name,
        caption: pack.name,
        lastmod: new Date().toISOString(),
    })).filter(img => img.loc)

    const allImages = [...bookImages, ...packImages]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allImages.map((img) => `  <url>
    <loc>${baseUrl}</loc>
    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>
    <lastmod>${img.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    })
}
