import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReadingListItem {
    id: string
    title: string
    author: string
    cover: string
    totalPages: number
    currentPage: number
    status: 'TO_READ' | 'READING' | 'COMPLETED'
    addedAt: string
}

export interface ReadingListStore {
    items: ReadingListItem[]
    addItem: (item: Omit<ReadingListItem, 'addedAt'>) => void
    removeItem: (id: string) => void
    updateProgress: (id: string, currentPage: number) => void
    isInReadingList: (id: string) => boolean
    clearReadingList: () => void
}

export const useReadingListStore = create<ReadingListStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const items = get().items
                if (!items.find((i) => i.id === item.id)) {
                    set({ items: [{ ...item, addedAt: new Date().toISOString() }, ...items] })
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) })
            },
            updateProgress: (id, currentPage) => {
                const items = get().items
                set({
                    items: items.map((i) => {
                        if (i.id === id) {
                            const status = currentPage >= i.totalPages ? 'COMPLETED' : currentPage > 0 ? 'READING' : 'TO_READ'
                            return { ...i, currentPage, status }
                        }
                        return i
                    })
                })
            },
            isInReadingList: (id) => {
                return !!get().items.find((i) => i.id === id)
            },
            clearReadingList: () => set({ items: [] }),
        }),
        {
            name: 'riwaya-reading-list',
            skipHydration: true,
        }
    )
)
