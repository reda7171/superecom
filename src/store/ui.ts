import { create } from 'zustand'

interface UIStore {
    isCartOpen: boolean
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
    // Notifications system
    notification: {
        message: string
        type: 'success' | 'error' | 'info'
        id: number
    } | null
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
    hideNotification: () => void
}

export const useUIStore = create<UIStore>((set) => ({
    isCartOpen: false,
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    notification: null,
    showNotification: (message, type = 'success') => {
        const id = Date.now()
        set({ notification: { message, type, id } })
        // Auto-hide after 5 seconds
        setTimeout(() => {
            set((state) => (state.notification?.id === id ? { notification: null } : {}))
        }, 5000)
    },
    hideNotification: () => set({ notification: null }),
}))
