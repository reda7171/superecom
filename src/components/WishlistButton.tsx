'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useWishlistStore, WishlistItem } from '@/store/wishlist'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { addToWishlist, removeFromWishlist } from '@/lib/actions/community-wishlist'
import { useUIStore } from '@/store/ui'
import { fbCustomEvents, fbPixelEvents } from '@/lib/facebook-pixel'

interface WishlistButtonProps {
    item: WishlistItem
    className?: string
    showText?: boolean
    variant?: 'icon' | 'full'
}

export default function WishlistButton({ item, className, showText = false, variant = 'icon' }: WishlistButtonProps) {
    const [mounted, setMounted] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const active = useWishlistStore(state => state.items.find((i) => i.id === item.id) !== undefined)
    const { addItem, removeItem } = useWishlistStore()
    const { showNotification } = useUIStore()

    useEffect(() => {
        useWishlistStore.persist.rehydrate()
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className={cn("rounded-full p-2 bg-gray-100", className)} disabled>
                <Heart className="w-5 h-5 text-gray-300" />
            </button>
        )
    }

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setSyncing(true)

        try {
            if (active) {
                // Synchroniser la suppression avec le serveur
                const res = await removeFromWishlist(item.id)
                if (res.success) {
                    removeItem(item.id)
                } else {
                    if (res.error === "Non connecté") {
                        showNotification("Veuillez vous connecter pour gérer vos favoris", 'error')
                        // Optionnel : Rediriger vers login
                        // router.push('/community/login')
                    } else {
                        showNotification(res.error || "Erreur lors de la suppression", 'error')
                    }
                }
            } else {
                const formData = new FormData()
                formData.append('title', item.title)
                if (item.author) formData.append('author', item.author)
                if (item.type === 'BOOK') formData.append('bookId', item.id)

                const res = await addToWishlist(formData)

                if (res.success) {
                    addItem(item)
                    // Facebook Pixel Tracking
                    fbPixelEvents.addToWishlist({
                        id: item.id,
                        title: item.title
                    })
                } else {
                    if (res.error === "Non connecté") {
                        showNotification("Veuillez vous connecter pour ajouter aux favoris", 'error')
                        // Optionnel : Rediriger vers login
                        // router.push('/community/login')
                    } else {
                        showNotification(res.error || "Erreur lors de l'ajout", 'error')
                    }
                }
            }
        } catch (error) {
            console.error('Wishlist error:', error)
            showNotification("Une erreur inattendue est survenue", 'error')
        } finally {
            setSyncing(false)
        }
    }

    if (variant === 'full') {
        return (
            <button
                onClick={toggle}
                disabled={syncing}
                className={cn(
                    "flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold transition-all border-2",
                    active
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        : "bg-white border-gray-200 text-gray-900 hover:border-black",
                    className
                )}
            >
                {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5 transition-colors", active ? "fill-red-600 text-red-600" : "text-gray-900")} />}
                <span>{active ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
            </button>
        )
    }

    return (
        <button
            onClick={toggle}
            disabled={syncing}
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 group/wishlist",
                active ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-400",
                className
            )}
            title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5 transition-colors", active && "fill-current")} />}
        </button>
    )
}
