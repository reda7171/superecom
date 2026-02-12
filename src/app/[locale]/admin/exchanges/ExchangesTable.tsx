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
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Demandeur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Livre demandé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Propriétaire
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {exchanges.map((exchange) => (
                        <tr key={exchange.id} className="hover:bg-gray-50 transition-colors">
                            {/* Demandeur */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {exchange.requester.fullName}
                                        </p>
                                        <p className="text-xs text-gray-500">{exchange.requester.city}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Livre demandé */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-14 bg-gray-100 rounded flex-shrink-0">
                                        {exchange.bookRequested.image ? (
                                            <Image
                                                src={exchange.bookRequested.image}
                                                alt={exchange.bookRequested.title}
                                                fill
                                                className="object-cover rounded"
                                                unoptimized
                                            />
                                        ) : (
                                            <BookOpen className="w-6 h-6 text-gray-300 absolute inset-0 m-auto" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                            {exchange.bookRequested.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{exchange.bookRequested.author}</p>
                                        <p className="text-xs text-gray-400">{exchange.bookRequested.condition}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Propriétaire */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {exchange.responder.fullName}
                                        </p>
                                        <p className="text-xs text-gray-500">{exchange.responder.city}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${exchange.type === 'DIRECT'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-orange-100 text-orange-800'
                                    }`}>
                                    {exchange.type === 'DIRECT' ? 'Direct' : 'Crédit'}
                                </span>
                            </td>

                            {/* Statut */}
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[exchange.status]?.className || 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {STATUS_BADGES[exchange.status]?.label || exchange.status}
                                </span>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(exchange.createdAt).toLocaleDateString('fr-FR')}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/exchanges/${exchange.id}`}
                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    {exchange.status !== 'CANCELLED' && exchange.status !== 'COMPLETED' && (
                                        <button
                                            onClick={() => handleCancel(exchange.id)}
                                            disabled={loading === exchange.id}
                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
