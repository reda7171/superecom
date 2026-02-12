'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function MarkAllReadButton() {
    const t = useTranslations('Community.Notifications')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleMarkAllRead() {
        setLoading(true)
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST'
            })

            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Error marking all as read:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Check className="w-4 h-4" />
            )}
            {t('MarkAllRead')}
        </button>
    )
}
