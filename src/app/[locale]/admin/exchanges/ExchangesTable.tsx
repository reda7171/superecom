'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Eye, XCircle, BookOpen, User, ArrowRight } from 'lucide-react'
import { cancelExchange } from '@/lib/actions/admin-exchanges'
import { useRouter } from 'next/navigation'

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
    ACCEPTED: { label: 'Accepté', className: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'En cours', className: 'bg-purple-100 text-purple-800' },
    COMPLETED: { label: 'Complété', className: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Annulé', className: 'bg-red-100 text-red-800' },
    REJECTED: { label: 'Rejeté', className: 'bg-gray-100 text-gray-800' },
    COUNTER_OFFER: { label: 'Contre-offre', className: 'bg-indigo-100 text-indigo-800' },
}

interface Exchange {
    id: string
    type: string
    status: string
    createdAt: Date
    requester: {
        id: string
        fullName: string
        city: string
        rating: number
    }
    responder: {
        id: string
        fullName: string
        city: string
        rating: number
    }
    bookRequested: {
        id: string
        title: string
        author: string
        condition: string
        image?: string
    }
    bookOffered?: {
        id: string
        title: string
        author: string
        condition: string
        image?: string
    }
}

export default function ExchangesTable({ exchanges }: { exchanges: Exchange[] }) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    async function handleCancel(id: string) {
        if (!confirm('Êtes-vous sûr de vouloir annuler cet échange ?')) {
            return
        }

        const reason = prompt('Raison de l\'annulation (optionnel):')

        setLoading(id)
        const result = await cancelExchange(id, reason || undefined)
        setLoading(null)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    if (exchanges.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun échange trouvé</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Demandeur</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Livre Demandé</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cible</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {exchanges.map((exchange) => (
                        <tr key={exchange.id} className="hover:bg-gray-50 transition-all group">
                            {/* Demandeur */}
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10 font-black text-xs uppercase transition-transform group-hover:scale-110 shrink-0">
                                        {exchange.requester.fullName[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-black uppercase tracking-tight italic truncate">
                                            {exchange.requester.fullName}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">{exchange.requester.city}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Livre demandé */}
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                        {exchange.bookRequested.image ? (
                                            <img
                                                src={exchange.bookRequested.image}
                                                alt={exchange.bookRequested.title}
                                                className="w-full h-full object-cover unoptimized"
                                            />
                                        ) : (
                                            <BookOpen className="w-6 h-6 text-gray-300 absolute inset-0 m-auto" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-black uppercase truncate italic mb-1">
                                            {exchange.bookRequested.title}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{exchange.bookRequested.author}</p>
                                        <span className="inline-block mt-1 text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter border border-blue-100">
                                            {exchange.bookRequested.condition}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            {/* Propriétaire */}
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-black text-xs uppercase transition-transform group-hover:scale-110 shrink-0">
                                        {exchange.responder.fullName[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-black uppercase tracking-tight italic truncate">
                                            {exchange.responder.fullName}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">{exchange.responder.city}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Type */}
                            <td className="px-10 py-6 whitespace-nowrap">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${exchange.type === 'DIRECT'
                                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                                    : 'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                    {exchange.type === 'DIRECT' ? 'Direct' : 'Crédit'}
                                </span>
                            </td>

                            {/* Statut */}
                            <td className="px-10 py-6 whitespace-nowrap">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${STATUS_BADGES[exchange.status]?.className.replace('100', '50').replace('800', '600') || 'bg-gray-50 text-gray-600 border-gray-100'
                                    }`}>
                                    {STATUS_BADGES[exchange.status]?.label || exchange.status}
                                </span>
                                <p className="text-[8px] font-bold text-gray-300 mt-2 uppercase tracking-tighter">
                                    {new Date(exchange.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </p>
                            </td>

                            {/* Actions */}
                            <td className="px-10 py-6 text-right">
                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/admin/exchanges/${exchange.id}`}
                                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-2xl transition-all shadow-sm active:scale-95"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    {exchange.status !== 'CANCELLED' && exchange.status !== 'COMPLETED' && (
                                        <button
                                            onClick={() => handleCancel(exchange.id)}
                                            disabled={loading === exchange.id}
                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}
