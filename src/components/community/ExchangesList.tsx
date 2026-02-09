'use client'

import { useState } from 'react'
import { acceptExchange, rejectExchange, completeExchange } from '@/lib/actions/community-exchanges'
import { useRouter } from 'next/navigation'
import { BookOpen, User, Check, X, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Coins, MessageSquare, Flag } from 'lucide-react'
import Link from 'next/link'

interface Exchange {
    id: string
    type: string
    status: string
    message: string | null
    createdAt: Date
    requester?: { fullName: string | null; rating: number; city: string | null }
    responder?: { fullName: string | null; rating: number; city: string | null }
    bookRequested: { title: string; author: string; image: string | null }
    bookOffered: { title: string; author: string; image: string | null } | null
}

interface ExchangesListProps {
    exchanges: Exchange[]
    type: 'received' | 'sent'
}

export default function ExchangesList({ exchanges, type }: ExchangesListProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    async function handleAccept(exchangeId: string) {
        setLoading(exchangeId)
        const res = await acceptExchange(exchangeId)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(null)
    }

    async function handleReject(exchangeId: string) {
        if (!confirm('Voulez-vous vraiment refuser cet échange ?')) return
        setLoading(exchangeId)
        const res = await rejectExchange(exchangeId)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(null)
    }

    async function handleComplete(exchangeId: string) {
        if (!confirm('Voulez-vous vraiment marquer cet échange comme terminé ?')) return
        setLoading(exchangeId)
        const res = await completeExchange(exchangeId)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(null)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full"><Clock className="w-3 h-3" /> En attente</span>
            case 'ACCEPTED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-600 px-3 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Accepté</span>
            case 'REJECTED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-3 py-1 rounded-full"><XCircle className="w-3 h-3" /> Refusé</span>
            case 'COMPLETED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-3 py-1 rounded-full"><Check className="w-3 h-3" /> Terminé</span>
            default:
                return <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{status}</span>
        }
    }

    if (exchanges.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">
                    {type === 'received' ? 'Aucune demande reçue' : 'Aucune demande envoyée'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {exchanges.map((exchange) => (
                <div key={exchange.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-colors">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-black">
                                {type === 'received' ? exchange.requester?.fullName : exchange.responder?.fullName}
                            </span>
                        </div>
                        {getStatusBadge(exchange.status)}
                    </div>

                    {/* Exchange Type */}
                    <div className="flex items-center gap-2 mb-4">
                        {exchange.type === 'DIRECT' ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full">
                                <RefreshCw className="w-3 h-3" /> Échange Direct
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                                <Coins className="w-3 h-3" /> Crédits
                            </span>
                        )}
                    </div>

                    {/* Books */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Book Requested */}
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                {type === 'received' ? 'Votre livre' : 'Demandé'}
                            </p>
                            <div className="flex gap-2">
                                <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {exchange.bookRequested.image ? (
                                        <img src={exchange.bookRequested.image} alt={exchange.bookRequested.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-black line-clamp-1">{exchange.bookRequested.title}</p>
                                    <p className="text-[10px] font-bold text-gray-400 line-clamp-1">{exchange.bookRequested.author}</p>
                                </div>
                            </div>
                        </div>

                        {/* Book Offered */}
                        {exchange.bookOffered ? (
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    {type === 'received' ? 'Proposé' : 'Votre livre'}
                                </p>
                                <div className="flex gap-2">
                                    <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {exchange.bookOffered.image ? (
                                            <img src={exchange.bookOffered.image} alt={exchange.bookOffered.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-black line-clamp-1">{exchange.bookOffered.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400 line-clamp-1">{exchange.bookOffered.author}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100 flex items-center justify-center">
                                <p className="text-xs font-bold text-yellow-600 text-center">Paiement en crédits</p>
                            </div>
                        )}
                    </div>

                    {/* Message */}
                    {exchange.message && (
                        <div className="bg-white rounded-xl p-3 mb-4 border border-gray-100">
                            <p className="text-xs text-gray-600 italic">"{exchange.message}"</p>
                        </div>
                    )}

                    {/* Actions (Only for received PENDING) */}
                    {type === 'received' && exchange.status === 'PENDING' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAccept(exchange.id)}
                                disabled={loading === exchange.id}
                                className="flex-1 bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === exchange.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Accepter</>}
                            </button>
                            <button
                                onClick={() => handleReject(exchange.id)}
                                disabled={loading === exchange.id}
                                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === exchange.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /> Refuser</>}
                            </button>
                        </div>
                    )}

                    {/* Actions (For Accepted - Finish) */}
                    {exchange.status === 'ACCEPTED' && (
                        <div className="flex gap-2">
                            <Link
                                href={`/community/exchanges/${exchange.id}/chat`}
                                className="flex-1 bg-white border border-black text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Chat
                            </Link>
                            <button
                                onClick={() => handleComplete(exchange.id)}
                                disabled={loading === exchange.id}
                                className="flex-1 bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === exchange.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Flag className="w-4 h-4" /> Terminer</>}
                            </button>
                        </div>
                    )}

                    {/* Chat Button (Only for Completed) */}
                    {exchange.status === 'COMPLETED' && (
                        <Link
                            href={`/community/exchanges/${exchange.id}/chat`}
                            className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Historique Chat
                        </Link>
                    )}

                    {/* Date */}
                    <p className="text-[9px] font-bold text-gray-400 mt-3 text-center">
                        {new Date(exchange.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            ))}
        </div>
    )
}
