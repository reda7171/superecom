'use client'

import { useState } from 'react'
import { BookOpen, Check } from 'lucide-react'
import { addToReadingList } from '@/lib/actions/reading-list'
import { useUIStore } from '@/store/ui'
import { ReadingStatus } from '@prisma/client'

interface AddToReadingListProps {
    bookId: string
    title: string
    author: string
    cover: string
    totalPages?: number
}

export default function AddToReadingListButton({ bookId, title, author, cover, totalPages = 0 }: AddToReadingListProps) {
    const [loading, setLoading] = useState(false)
    const [added, setAdded] = useState(false)
    const { showNotification } = useUIStore()

    const handleAdd = async () => {
        setLoading(true)
        const result = await addToReadingList({
            bookId,
            title,
            author,
            cover,
            totalPages: totalPages || 300, // Default if not provided
            status: ReadingStatus.TO_READ
        })

        if (result.success) {
            setAdded(true)
            showNotification('Ajouté à votre liste de lecture', 'success')
        } else {
            showNotification(result.error || 'Erreur', 'error')
        }
        setLoading(false)
    }

    if (added) {
        return (
            <button disabled className="p-2 text-green-600 bg-green-50 rounded-full">
                <Check className="w-5 h-5" />
            </button>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
            title="Ajouter à ma liste de lecture"
        >
            <BookOpen className="w-5 h-5" />
        </button>
    )
}
