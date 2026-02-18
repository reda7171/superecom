'use client'

import { useEffect } from 'react'
import { fbPixelEvents } from '@/lib/facebook-pixel'

interface SetPixelViewProps {
    id: string
    title: string
    price: number
    category?: string
}

export default function SetPixelView({ id, title, price, category }: SetPixelViewProps) {
    useEffect(() => {
        fbPixelEvents.viewContent({
            id,
            title,
            price,
            category
        })
    }, [id, title, price, category])

    return null
}
