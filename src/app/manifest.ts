import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SuperEcom - Librairie en Ligne au Maroc',
        short_name: 'SuperEcom',
        description: 'Découvrez et achetez des livres au Maroc. Livraison rapide et paiement à la livraison.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#FFD700',
        orientation: 'portrait-primary',
        categories: ['products', 'shopping', 'education'],
        lang: 'fr-MA',
        dir: 'auto',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    }
}
