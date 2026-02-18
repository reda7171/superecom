import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/*/admin',
                    '/api',
                    '/_next',
                    '/static',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin', '/*/admin'],
                crawlDelay: 0,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin', '/*/admin'],
                crawlDelay: 0,
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
