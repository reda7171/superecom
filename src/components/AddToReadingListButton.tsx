'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Check } from 'lucide-react'
import { addToReadingList } from '@/lib/actions/reading-list'
import { useUIStore } from '@/store/ui'
import { ReadingStatus } from '@prisma/client'
import { useReadingListStore } from '@/store/reading-list'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AddToReadingListProps {
    bookId: string
    title: string
    author: string
    cover: string
    totalPages?: number
    className?: string
}

export default function AddToReadingListButton({ bookId, title, author, cover, totalPages = 300, className }: AddToReadingListProps) {
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { addItem, isInReadingList } = useReadingListStore()
    const isAdded = isInReadingList(bookId)
    const { showNotification } = useUIStore()
    const t = useTranslations()

    useEffect(() => {
        useReadingListStore.persist.rehydrate()
        setMounted(true)
    }, [])

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isAdded) return

        setLoading(true)

        // On tente l'ajout serveur d'abord (pour les connectés)
        const result = await addToReadingList({
            bookId,
            title,
            author,
            cover,
            totalPages: totalPages,
            status: ReadingStatus.TO_READ
        })

        if (result.success) {
            showNotification(result.message || t('Common.AddedToReadingList'), 'success')
            // On met à jour le store local aussi pour que le bouton change d'état immédiatement
            addItem({
                id: bookId,
                title,
                author,
                cover,
                totalPages,
                currentPage: 0,
                status: 'TO_READ'
            })
        } else {
            // Si erreur de connexion
            if (result.error === 'Vous devez être connecté') {
                showNotification("Veuillez vous connecter pour gérer votre liste de lecture", 'error')
                // Optionnel : Rediriger vers login
                // router.push('/community/login')
            } else {
                showNotification(result.error || 'Erreur', 'error')
            }
        }
        setLoading(false)
    }

    if (!mounted) return <div className="p-2 w-9 h-9" />

    if (isAdded) {
        return (
            <button disabled className={cn("p-2 text-emerald-600 bg-emerald-50 rounded-full", className)}>
                <Check className="w-5 h-5" />
            </button>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading}
            className={cn("p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 bg-white shadow-sm rounded-full transition-all active:scale-95", className)}
            title="Ajouter à ma liste de lecture"
        >
            <BookOpen className={cn("w-5 h-5", loading && "animate-pulse")} />
        </button>
    )
}
