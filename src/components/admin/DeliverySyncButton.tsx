'use client'

import { useState } from 'react'
import { Truck, Loader2, CheckCircle } from 'lucide-react'
import { syncOrderToWithYou } from '@/lib/actions/admin-orders'
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
        if (!confirm('Voulez-vous envoyer cette commande à WithYou ?')) return

        setLoading(true)
        try {
            const result = await syncOrderToWithYou(orderId)
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



    if (trackingID) {
        return (
            <div className="flex flex-col gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest leading-none">Expédié via WithYou</p>
                        <p className="mt-1 text-sm font-black text-green-900 tracking-tighter">ID: {trackingID}</p>
                    </div>
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
            Envoyer à WithYou
        </button>
    )
}
