'use client'

import { useState, useTransition } from 'react'
import { acceptExchange, rejectExchange, completeExchange } from '@/lib/actions/community-exchanges'
import { Link, useRouter } from '@/i18n/routing'
import { fbCustomEvents } from '@/lib/facebook-pixel'
import { useTranslations } from 'next-intl'
import { BookOpen, Check, X, Clock, CheckCircle, Loader2, RefreshCw, Coins, MessageSquare, Flag, Star } from 'lucide-react'
import RatingModal from './RatingModal'
import ConfirmationModal from './ConfirmationModal'
import DonationModal from './DonationModal'

import { useUIStore } from '@/store/ui'

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
    deliveryMethod?: string | null
    meetingPoint?: string | null
    meetingDate?: Date | null
    rating?: any | null
}

interface ExchangesListProps {
    exchanges: Exchange[]
    type: 'received' | 'sent'
}

export default function ExchangesList({ exchanges, type }: ExchangesListProps) {
    const router = useRouter()
    const { showNotification } = useUIStore()
    const [loading, setLoading] = useState<string | null>(null)
    const [ratingModalOpen, setRatingModalOpen] = useState(false)
    const [ratingExchangeId, setRatingExchangeId] = useState<string | null>(null)
    const t = useTranslations('Community.Exchanges')
    const [isPending, startTransition] = useTransition()

    // Confirmation Modal State
    const [confirmAction, setConfirmAction] = useState<{
        id: string | null;
        type: 'REJECT' | 'COMPLETE' | null;
    }>({ id: null, type: null })

    const [showDonationModal, setShowDonationModal] = useState(false)

    const handleConfirmAction = async () => {
        const { id, type } = confirmAction
        if (!id || !type) return

        setLoading(id)

        startTransition(async () => {
            try {
                const res = type === 'REJECT' ? await rejectExchange(id) : await completeExchange(id)

                if (res.success) {
                    showNotification(type === 'REJECT' ? t('Status.REJECTED') : t('Status.COMPLETED'), 'success')
                    router.refresh()

                    // Show donation modal if exchange completed
                    if (type === 'COMPLETE') {
                        fbCustomEvents.exchangeCompleted(id)
                        setTimeout(() => setShowDonationModal(true), 500)
                    }
                } else {
                    showNotification(res.error || "Error", 'error')
                }
            } catch (err) {
                console.error("Action error:", err)
                showNotification("Une erreur est survenue", 'error')
            } finally {
                setLoading(null)
                setConfirmAction({ id: null, type: null })
            }
        })
    }

    async function handleAccept(exchangeId: string) {
        setLoading(exchangeId)
        const res = await acceptExchange(exchangeId)
        if (res.success) {
            showNotification(t('Status.ACCEPTED'), 'success')
            startTransition(() => {
                router.refresh()
            })
        } else {
            showNotification(res.error || "Error", 'error')
        }
        setLoading(null)
    }

    async function handleReject(exchangeId: string) {
        setConfirmAction({ id: exchangeId, type: 'REJECT' })
    }

    async function handleComplete(exchangeId: string) {
        setConfirmAction({ id: exchangeId, type: 'COMPLETE' })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full"><Clock className="w-3 h-3" /> {t('Status.PENDING')}</span>
            case 'ACCEPTED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-3 py-1 rounded-full"><Check className="w-3 h-3" /> {t('Status.ACCEPTED')}</span>
            case 'REJECTED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-3 py-1 rounded-full"><X className="w-3 h-3" /> {t('Status.REJECTED')}</span>
            case 'COMPLETED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-600 px-3 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> {t('Status.COMPLETED')}</span>
            case 'CANCELLED':
                return <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-full"><X className="w-3 h-3" /> {t('Status.CANCELLED')}</span>
            default:
                return null
        }
    }

    if (exchanges.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-black text-xl text-black mb-2">
                    {type === 'received' ? t('EmptyReceived') : t('EmptySent')}
                </h3>
                <Link
                    href="/community/market"
                    className="text-black font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                    {t('ExploreMarket')} →
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6">
                {exchanges.map((exchange) => (
                    <div
                        key={exchange.id}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group"
                    >
                        {/* Header: User Info */}
                        <div className="p-4 sm:p-6 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-4">
                                {getStatusBadge(exchange.status)}
                                <span className="text-[10px] font-bold text-gray-400">
                                    {new Date(exchange.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black text-xs">
                                    {(type === 'received' ? exchange.requester?.fullName : exchange.responder?.fullName)?.[0] || 'U'}
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-black">
                                        {type === 'received' ? exchange.requester?.fullName : exchange.responder?.fullName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            {type === 'received' ? exchange.requester?.city : exchange.responder?.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content: Books */}
                        <div className="p-4 sm:p-6 flex-grow">
                            <div className="space-y-4">
                                {/* Requested Book */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {exchange.bookRequested.image ? (
                                            <img src={exchange.bookRequested.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-300" /></div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('Requested')}</p>
                                        <p className="text-xs font-black text-black truncate">{exchange.bookRequested.title}</p>
                                    </div>
                                </div>

                                {/* Exchange Icon */}
                                <div className="flex justify-center -my-2 relative z-10">
                                    <div className="bg-white p-2 rounded-full border border-gray-100 shadow-sm">
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Offered Product */}
                                {exchange.type === 'DIRECT' ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            {exchange.bookOffered?.image ? (
                                                <img src={exchange.bookOffered.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-300" /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('Offered')}</p>
                                            <p className="text-xs font-black text-black truncate">{exchange.bookOffered?.title}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                                            <Coins className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('Offered')}</p>
                                            <p className="text-xs font-black text-black">{t('Credits')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Meeting Details */}
                            {(exchange.meetingPoint || exchange.meetingDate) && (
                                <div className="mt-6 p-4 bg-pixio-cream/50 rounded-2xl border border-pixio-cream space-y-3">
                                    <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">{t('MeetingDetails') || 'Détails de rencontre'}</p>

                                    {exchange.meetingPoint && (
                                        <div className="flex items-center gap-3">
                                            <Flag className="w-3 h-3 text-black" />
                                            <p className="text-[11px] font-bold text-black">{exchange.meetingPoint}</p>
                                        </div>
                                    )}

                                    {exchange.meetingDate && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-3 h-3 text-black" />
                                            <p className="text-[11px] font-bold text-black">
                                                {new Date(exchange.meetingDate).toLocaleString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message Preview */}
                            {exchange.message && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                        "{exchange.message}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions (Only for Received + Pending) */}
                        {type === 'received' && exchange.status === 'PENDING' && (
                            <div className="p-4 sm:p-6 pt-0 flex gap-3">
                                <button
                                    onClick={() => handleReject(exchange.id)}
                                    disabled={loading === exchange.id}
                                    className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    {t('Actions.Reject')}
                                </button>
                                <button
                                    onClick={() => handleAccept(exchange.id)}
                                    disabled={loading === exchange.id}
                                    className="flex-1 bg-black text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-black/10"
                                >
                                    {loading === exchange.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            {t('Actions.Accept')}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Actions (For Accepted - Finish) */}
                        {exchange.status === 'ACCEPTED' && (
                            <div className="p-6 pt-0 flex gap-2">
                                <Link
                                    href={`/community/exchanges/${exchange.id}/chat`}
                                    className="flex-1 bg-white border border-black text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {t('ChatButton')}
                                </Link>
                                <button
                                    onClick={() => handleComplete(exchange.id)}
                                    disabled={loading === exchange.id}
                                    className="flex-1 bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading === exchange.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Flag className="w-4 h-4" /> {t('FinishButton')}</>}
                                </button>
                            </div>
                        )}

                        {/* Chat Button (Only for Completed) */}
                        {exchange.status === 'COMPLETED' && (
                            <div className="p-6 pt-0 space-y-3">
                                <Link
                                    href={`/community/exchanges/${exchange.id}/chat`}
                                    className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {t('HistoryChat')}
                                </Link>

                                {exchange.rating ? (
                                    <div className="flex items-center justify-center gap-1 bg-yellow-50 text-yellow-600 py-3 rounded-xl">
                                        <Star className="w-4 h-4 fill-yellow-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {exchange.rating.rating} / 5
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            startTransition(() => {
                                                setRatingExchangeId(exchange.id)
                                                setRatingModalOpen(true)
                                            })
                                        }}
                                        className="w-full bg-yellow-400 text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100"
                                    >
                                        <Star className="w-4 h-4" />
                                        {t('RateExchange')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {ratingExchangeId && (
                <RatingModal
                    exchangeId={ratingExchangeId}
                    isOpen={ratingModalOpen}
                    onClose={() => {
                        setRatingModalOpen(false)
                        setRatingExchangeId(null)
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={!!confirmAction.id}
                title={confirmAction.type === 'REJECT' ? t('Actions.Reject') : t('FinishButton')}
                message={confirmAction.type === 'REJECT'
                    ? "Êtes-vous sûr de vouloir refuser cet échange ?"
                    : "Voulez-vous marquer cet échange comme terminé ?"
                }
                variant={confirmAction.type === 'REJECT' ? 'danger' : 'info'}
                onConfirm={handleConfirmAction}
                onClose={() => setConfirmAction({ id: null, type: null })}
                confirmText="Oui"
                cancelText="Non"
            />

            <DonationModal
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
            />
        </>
    )
}
