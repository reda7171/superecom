import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Riwaya - La Bibliothèque Commune',
        short_name: 'Riwaya',
        description: 'Plateforme de vente et d\'échange de livres au Maroc.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FBF8F3', // pixio-cream
        theme_color: '#000000',
        icons: [
            {
                src: '/globe.svg', // Placeholder
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/globe.svg', // Placeholder
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    }
}
