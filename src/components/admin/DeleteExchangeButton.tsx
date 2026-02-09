'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteExchange } from '@/lib/actions/admin-community'
import { useRouter } from 'next/navigation'

export default function DeleteExchangeButton({ exchangeId }: { exchangeId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet échange ?')) return

        setLoading(true)
        const result = await deleteExchange(exchangeId)

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
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    )
}
