'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteAllBooks } from '@/lib/actions/books'
import { useRouter } from 'next/navigation'

export default function EmptyLibraryButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEmptyLibrary = async () => {
        const confirm1 = window.confirm('ATTENTION : Voulez-vous vraiment vider toute la bibliothèque ? Cette action est irréversible.')
        if (!confirm1) return

        const confirm2 = window.prompt('Pour confirmer la suppression de TOUS les livres, tapez "SUPPRIMER" en majuscules :')
        if (confirm2 !== 'SUPPRIMER') {
            alert('Suppression annulée.')
            return
        }

        setLoading(true)
        const result = await deleteAllBooks()
        setLoading(false)

        if (result.success) {
            alert('La bibliothèque a été vidée avec succès.')
            router.refresh()
        } else {
            alert(result.error || 'Une erreur est survenue.')
        }
    }

    return (
        <button
            onClick={handleEmptyLibrary}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
            <Trash2 className="w-5 h-5 mr-2" />
            {loading ? 'Suppression...' : 'Vider'}
        </button>
    )
}
