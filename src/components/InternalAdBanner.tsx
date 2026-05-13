'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AdPlacement } from '@prisma/client'

interface Ad {
    id: string
    title: string
    image: string
    link: string | null
    placement: AdPlacement
    isActive: boolean
    priority: number
    viewCount: number
    clickCount: number
    startDate: Date | null
    endDate: Date | null
    createdAt: Date
    updatedAt: Date
}

interface InternalAdBannerProps {
    ad: Ad
    closeable?: boolean
}

export default function InternalAdBanner({ ad, closeable = false }: InternalAdBannerProps) {
    const [closed, setClosed] = useState(false)

    if (closed) return null

    const content = (
        <div className="relative group overflow-hidden rounded-2xl">
            {/* Bouton fermer */}
            {closeable && (
                <button
                    onClick={() => setClosed(true)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
            {/* Image de la pub */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </div>
    )

    if (ad.link) {
        return (
            <a href={ad.link} target="_blank" rel="noopener noreferrer sponsored">
                {content}
            </a>
        )
    }

    return content
}
