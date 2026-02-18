'use client'

import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist'
import { Link } from '@/i18n/routing'
import { useEffect, useState } from 'react'

export function WishlistHeaderIcon() {
    const items = useWishlistStore((state) => state.items)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="p-2 opacity-20">
                <Heart className="w-5 h-5 text-gray-900" />
            </div>
        )
    }

    const count = items.length

    return (
        <Link href="/wishlist" className="relative group block p-2 hover:bg-red-50 rounded-full transition-colors">
            <Heart className={`w-5 h-5 text-gray-900 group-hover:text-red-500 transition-colors ${count > 0 ? "fill-red-50 text-red-500" : ""}`} />
            {count > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-white scale-100 transition-transform group-hover:scale-110">
                    {count}
                </span>
            )}
        </Link>
    )
}
