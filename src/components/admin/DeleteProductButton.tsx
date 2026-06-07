'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteBook } from '@/lib/actions/admin-community'
import { useRouter } from 'next/navigation'

export default function DeleteProductButton({ productId }: { productId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return

        setLoading(true)
        const result = await deleteBook(productId)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                </>
            ) : (
                <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                </>
            )}
        </button>
    )
}
