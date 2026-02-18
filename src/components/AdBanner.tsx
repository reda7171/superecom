'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { trackAdView, trackAdClick } from '@/lib/actions/advertisements'
import { AdPlacement } from '@prisma/client'

interface Advertisement {
    id: string
    title: string
    image: string
    link?: string | null
    placement: AdPlacement
}

interface AdBannerProps {
    ad: Advertisement
    className?: string
    closeable?: boolean
}

export default function AdBanner({ ad, className = '', closeable = false }: AdBannerProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [hasTrackedView, setHasTrackedView] = useState(false)

    useEffect(() => {
        // Track view une seule fois
        if (!hasTrackedView && isVisible) {
            trackAdView(ad.id)
            setHasTrackedView(true)
        }
    }, [ad.id, hasTrackedView, isVisible])

    const handleClick = async () => {
        await trackAdClick(ad.id)
        if (ad.link) {
            window.open(ad.link, '_blank', 'noopener,noreferrer')
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        // Stocker dans localStorage pour ne pas réafficher pendant 24h
        localStorage.setItem(`ad_closed_${ad.id}`, Date.now().toString())
    }

    useEffect(() => {
        if (closeable) {
            const closedTime = localStorage.getItem(`ad_closed_${ad.id}`)
            if (closedTime) {
                const elapsed = Date.now() - parseInt(closedTime)
                // 24 heures = 86400000 ms
                if (elapsed < 86400000) {
                    setIsVisible(false)
                }
            }
        }
    }, [ad.id, closeable])

    if (!isVisible) return null

    return (
        <div className={`relative group ${className}`}>
            {closeable && (
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                    aria-label="Fermer la publicité"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            <div
                onClick={handleClick}
                className={`relative overflow-hidden rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] ${ad.link ? 'cursor-pointer' : 'cursor-default'
                    }`}
            >
                <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={ad.placement === 'HOMEPAGE_TOP'}
                />

                {/* Overlay avec titre */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm font-bold">{ad.title}</p>
                        {ad.link && (
                            <p className="text-white/80 text-xs mt-1">Cliquez pour en savoir plus →</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
