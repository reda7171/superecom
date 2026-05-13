'use client'

import Script from 'next/script'

interface AdSenseProps {
    publisherId: string
    isEnabled: boolean
}

export default function AdSense({ publisherId, isEnabled }: AdSenseProps) {
    if (!isEnabled || !publisherId) return null

    // Formatage du publisher ID s'il manque le préfixe ca-pub-
    const fullId = publisherId.startsWith('ca-pub-') ? publisherId : `ca-pub-${publisherId}`

    return (
        <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${fullId}`}
            crossOrigin="anonymous"
        />
    )
}
