'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { syncBooksStockToJumia } from '@/lib/actions/jumia'

export default function SyncJumiaStockButton() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{message: string, type: 'success'|'error'} | null>(null)

    const handleSync = async () => {
        setLoading(true)
        setStatus(null)
        try {
            const res = await syncBooksStockToJumia()
            setStatus({ message: res.message, type: res.success ? 'success' : 'error' })
            setTimeout(() => setStatus(null), 5000)
        } catch (error) {
            setStatus({ message: 'Erreur lors de la synchronisation', type: 'error' })
            setTimeout(() => setStatus(null), 5000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleSync}
                disabled={loading}
                className="inline-flex items-center px-5 py-2.5 bg-orange-50 text-orange-700 font-bold text-sm rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Synchro...' : 'Sync Jumia'}
            </button>
            {status && (
                <div className={`absolute top-full right-0 mt-2 p-3 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl z-50 flex items-center gap-2 ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {status.message}
                </div>
            )}
        </div>
    )
}
