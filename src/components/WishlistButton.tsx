'use client'

import { Heart } from 'lucide-react'
import { useWishlistStore, WishlistItem } from '@/store/wishlist'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
    item: WishlistItem
    className?: string
    showText?: boolean
    variant?: 'icon' | 'full'
}

export default function WishlistButton({ item, className, showText = false, variant = 'icon' }: WishlistButtonProps) {
    const [mounted, setMounted] = useState(false)
    const active = useWishlistStore(state => state.items.find((i) => i.id === item.id) !== undefined) // Sélecteur direct pour éviter l'appel fonction
    const { addItem, removeItem } = useWishlistStore()

    useEffect(() => {
        useWishlistStore.persist.rehydrate() // Hydrater manuellement
        setMounted(true)
    }, [])

    if (!mounted) {
        // Placeholder pour éviter le saut
        return (
            <button className={cn("rounded-full p-2 bg-gray-100", className)} disabled>
                <Heart className="w-5 h-5 text-gray-300" />
            </button>
        )
    }

    const toggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (active) removeItem(item.id)
        else addItem(item)
    }

    if (variant === 'full') {
        return (
            <button
                onClick={toggle}
                className={cn(
                    "flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold transition-all border-2",
                    active
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        : "bg-white border-gray-200 text-gray-900 hover:border-black",
                    className
                )}
            >
                <Heart className={cn("w-5 h-5 transition-colors", active ? "fill-red-600 text-red-600" : "text-gray-900")} />
                <span>{active ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
            </button>
        )
    }

    return (
        <button
            onClick={toggle}
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 group/wishlist",
                active ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-400",
                className
            )}
            title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart className={cn("w-5 h-5 transition-colors", active && "fill-current")} />
        </button>
    )
}
