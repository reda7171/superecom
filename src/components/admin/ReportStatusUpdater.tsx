'use client'

import { useState } from 'react'
import { updateReportStatus } from '@/lib/actions/reports'

export default function ReportStatusUpdater({ reportId, currentStatus }: { reportId: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false)

    async function handleUpdate(newStatus: string) {
        setLoading(true)
        await updateReportStatus(reportId, newStatus)
        setLoading(false)
    }

    if (currentStatus !== 'PENDING') {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${currentStatus === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {currentStatus === 'RESOLVED' ? 'Résolu' : 'Rejeté'}
            </span>
        )
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleUpdate('RESOLVED')}
                disabled={loading}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 disabled:opacity-50"
            >
                Résoudre
            </button>
            <button
                onClick={() => handleUpdate('DISMISSED')}
                disabled={loading}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-50"
            >
                Ignorer
            </button>
        </div>
    )
}
