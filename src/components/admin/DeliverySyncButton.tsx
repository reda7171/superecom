'use client'

import { useState } from 'react'
import { Truck, Loader2, CheckCircle, ExternalLink, Download } from 'lucide-react'
import { syncOrderToOlivraison, getOrderShippingLabel } from '@/lib/actions/admin-orders'
import { useRouter } from 'next/navigation'

interface DeliverySyncButtonProps {
    orderId: string
    trackingID?: string | null
    deliveryStatus?: string | null
}

export default function DeliverySyncButton({
    orderId,
    trackingID,
    deliveryStatus
}: DeliverySyncButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        if (!confirm('Voulez-vous envoyer cette commande à Olivraison ?')) return

        setLoading(true)
        try {
            const result = await syncOrderToOlivraison(orderId)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert('Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadLabel = async () => {
        setLoading(true)
        try {
            const result = await getOrderShippingLabel(orderId)
            if (result.success && result.stickerUrl) {
                window.open(result.stickerUrl, '_blank')
            } else {
                alert(result.error || 'Impossible de générer l\'étiquette')
            }
        } catch (error) {
            alert('Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    if (trackingID) {
        return (
            <div className="flex flex-col gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest leading-none">Expédié via Olivraison</p>
                        <p className="mt-1 text-sm font-black text-green-900 tracking-tighter">ID: {trackingID}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadLabel}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Étiquette
                    </button>
                    <a
                        href={`https://partners.olivraison.com/package/${trackingID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Suivre
                    </a>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Truck className="w-4 h-4" />
            )}
            Envoyer à Olivraison
        </button>
    )
}
