import { MetadataRoute } from 'next'
import { getBooks } from '@/lib/db/books'
import { getPacks } from '@/lib/db/packs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'
    const locales = ['fr', 'ar', 'en']

    // Pages statiques principales
    const staticRoutes = [
        '',
        '/books',
        '/packs',
        '/wishlist',
        '/tracking',
        '/about',
        '/contact',
        '/community/market',
        '/blog',
    ]

    // Générer les routes pour chaque locale
    const routes = locales.flatMap(locale =>
        staticRoutes.map((route) => ({
            url: `${baseUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: route === '' ? 1 : 0.8,
            alternates: {
                languages: Object.fromEntries(
                    locales.map(l => [l, `${baseUrl}/${l}${route}`])
                )
            }
        }))
    )

    // Livres dynamiques
    const books = await getBooks({ active: true })
    const bookRoutes = locales.flatMap(locale =>
        books.map((book) => ({
            url: `${baseUrl}/${locale}/books/${book.id}`,
            lastModified: book.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
            images: [book.image.startsWith('http') ? book.image : `${baseUrl}${book.image}`],
        }))
    )

    // Packs dynamiques
    const packs = await getPacks()
    const packRoutes = locales.flatMap(locale =>
        packs.map((pack) => ({
            url: `${baseUrl}/${locale}/packs/${pack.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            images: pack.image ? [pack.image] : [],
        }))
    )

    return [...routes, ...bookRoutes, ...packRoutes]
}
