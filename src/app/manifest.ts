import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Spa Information System',
        short_name: 'SpaCashier',
        description: 'A Progressive Web App built with Next.js',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0084d1',
        icons: [
            {
                src: '/images/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/images/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}