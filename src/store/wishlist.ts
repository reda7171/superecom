import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
    id: string
    type: 'BOOK' | 'PACK'
    title: string
    price: number
    image: string
    author?: string // Pour les livres
    slug: string // /products/id ou /packs/id
    category?: string // Pour filtrer si besoin
}

export interface WishlistStore {
    items: WishlistItem[]
    addItem: (item: WishlistItem) => void
    removeItem: (id: string) => void
    isInWishlist: (id: string) => boolean
    clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const items = get().items
                if (!items.find((i) => i.id === item.id)) {
                    set({ items: [item, ...items] }) // Ajout au début
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) })
            },
            isInWishlist: (id) => {
                return !!get().items.find((i) => i.id === id)
            },
            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'superEcom-wishlist',
            skipHydration: true, // On gère l'hydratation manuellement dans les composants pour éviter le mismatch
        }
    )
)
