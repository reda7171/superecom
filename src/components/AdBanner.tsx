'use client'

import { useEffect } from 'react'

interface AdBannerProps {
    publisherId: string
    slotId: string
    format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
    responsive?: boolean
    className?: string
}

export default function AdBanner({
    publisherId,
    slotId,
    format = 'auto',
    responsive = true,
    className = ''
}: AdBannerProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (err) {
            console.error('AdSense error:', err)
        }
    }, [])

    if (!publisherId || !slotId) return null

    // Formatage du publisher ID
    const fullId = publisherId.startsWith('ca-pub-') ? publisherId : `ca-pub-${publisherId}`

    return (
        <div className={`my-8 w-full flex justify-center overflow-hidden ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={fullId}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive.toString()}
            />
        </div>
    )
}
