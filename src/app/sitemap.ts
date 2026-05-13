import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const locales = ['fr', 'ar', 'en']
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://riwaya.store'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Pages statiques
    const staticPages = [
        '',
        '/books',
        '/packs',
        '/blog',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/tracking'
    ]

    const staticUrls = locales.flatMap((locale) =>
        staticPages.map((page) => ({
            url: `${baseUrl}/${locale}${page}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: page === '' ? 1 : 0.8,
        }))
    )

    // 2. Livres dynamiques
    let bookUrls: any[] = []
    try {
        const books = await prisma.book.findMany({
            select: { id: true, updatedAt: true }
        })
        bookUrls = locales.flatMap((locale) =>
            books.map((book) => ({
                url: `${baseUrl}/${locale}/books/${book.id}`,
                lastModified: book.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
        )
    } catch (e) {
        console.warn('⚠️ Sitemaps: Could not fetch books during build')
    }

    // 3. Articles de blog dynamiques
    let postUrls: any[] = []
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true }
        })
        postUrls = locales.flatMap((locale) =>
            posts.map((post) => ({
                url: `${baseUrl}/${locale}/blog/${post.slug}`,
                lastModified: post.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }))
        )
    } catch (e) {
        console.warn('⚠️ Sitemaps: Could not fetch posts during build')
    }

    // 4. Packs dynamiques
    let packUrls: any[] = []
    try {
        const packs = await prisma.pack.findMany({
            where: { active: true },
            select: { id: true }
        })
        packUrls = locales.flatMap((locale) =>
            packs.map((pack) => ({
                url: `${baseUrl}/${locale}/packs/${pack.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
        )
    } catch (e) {
        console.warn('⚠️ Sitemaps: Could not fetch packs during build')
    }

    return [...staticUrls, ...bookUrls, ...postUrls, ...packUrls]
}
