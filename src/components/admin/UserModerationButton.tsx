'use client'

import { useState } from 'react'
import { toggleUserStatus } from '@/lib/actions/admin-community'
import { Ban, CheckCircle } from 'lucide-react'

export default function UserModerationButton({ userId, isBanned }: { userId: string, isBanned: boolean }) {
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        if (!confirm(isBanned ? "Débannir cet utilisateur ?" : "Bannir cet utilisateur ? Cette action masquera ses livres.")) {
            return
        }

        setLoading(true)
        const result = await toggleUserStatus(userId)
        setLoading(false)

        if (!result.success) {
            alert(result.error)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${isBanned
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
        >
            {isBanned ? (
                <>
                    <CheckCircle className="w-3 h-3" />
                    Débannir
                </>
            ) : (
                <>
                    <Ban className="w-3 h-3" />
                    Bannir
                </>
            )}
        </button>
    )
}
