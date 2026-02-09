import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/checkout/',
                '/api/',
                '/account/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
