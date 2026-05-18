import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    type: 'BOOK' | 'PACK' | 'GIFT' | 'DIGITAL'
    id: string
    title: string
    price: number
    quantity: number
    image: string
    // Optionnel : pour les packs
    booksCount?: number
    shippingFees?: number
}

interface CartStore {
    items: CartItem[]

    // Actions
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void

    // Computed
    getTotalPrice: () => number
    getTotalItems: () => number
    getItemQuantity: (id: string) => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            // Ajouter un item au panier
            addItem: (item) => {
                const items = get().items
                const existingItem = items.find((i) => i.id === item.id)

                if (existingItem) {
                    // Incrémenter la quantité si l'item existe déjà
                    set({
                        items: items.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    })
                } else {
                    // Ajouter le nouvel item
                    set({
                        items: [...items, { ...item, quantity: 1 }],
                    })
                }
            },

            // Supprimer un item du panier
            removeItem: (id) => {
                set({
                    items: get().items.filter((item) => item.id !== id),
                })
            },

            // Mettre à jour la quantité d'un item
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    // Si quantité <= 0, supprimer l'item
                    get().removeItem(id)
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.id === id ? { ...item, quantity } : item
                        ),
                    })
                }
            },

            // Vider le panier
            clearCart: () => {
                set({ items: [] })
            },

            // Calculer le prix total
            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                )
            },

            // Calculer le nombre total d'items
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0)
            },

            // Obtenir la quantité d'un item spécifique
            getItemQuantity: (id) => {
                const item = get().items.find((i) => i.id === id)
                return item ? item.quantity : 0
            },
        }),
        {
            name: 'riwaya-cart-storage', // Nom de la clé dans localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
)
