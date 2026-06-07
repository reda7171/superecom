'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { normalizeImage } from '@/lib/utils'

interface ImageWithFallbackProps {
    src?: string | null
    alt: string
    className?: string
    fallback?: string
}

/**
 * Composant client pour afficher une image avec fallback.
 * Optimisé avec next/image pour WebP/AVIF et dimensionnement automatique via srcSet.
 */
export default function ImageWithFallback({
    src,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '/product-placeholder.png',
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(normalizeImage(src || ''))

    useEffect(() => {
        setImgSrc(normalizeImage(src || ''))
    }, [src])

    return (
        <Image
            src={imgSrc || fallback}
            alt={alt}
            width={800}
            height={1200}
            className={className}
            onError={() => {
                setImgSrc(fallback)
            }}
        />
    )
}
