import { MetadataRoute } from 'next'
import { getBooks } from '@/lib/db/books'
import { getPacks } from '@/lib/db/packs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'

    // Pages statiques principales
    const routes = [
        '',
        '/books',
        '/packs',
        '/wishlist',
        '/tracking',
        '/about',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Livres dynamiques
    const books = await getBooks({ active: true })
    const bookRoutes = books.map((book) => ({
        url: `${baseUrl}/books/${book.id}`,
        lastModified: book.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // Packs dynamiques
    const packs = await getPacks()
    const packRoutes = packs.map((pack) => ({
        url: `${baseUrl}/packs/${pack.id}`,
        lastModified: new Date(), // Pas de updatedAt sur Pack dans le schema actuel
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // On combine tout
    return [...routes, ...bookRoutes, ...packRoutes]
}
