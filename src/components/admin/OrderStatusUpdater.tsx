'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/lib/actions/orders'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown } from 'lucide-react'

const STAGES = [
    { value: 'PENDING', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMED', label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
    { value: 'SHIPPED', label: 'En livraison', color: 'bg-purple-100 text-purple-800' },
    { value: 'DELIVERED', label: 'Livrée', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Annulée', color: 'bg-red-100 text-red-800' },
]

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const currentStage = STAGES.find(s => s.value === currentStatus) || STAGES[0]

    const handleUpdate = async (newStatus: string) => {
        setIsUpdating(true)
        setIsOpen(false)
        try {
            const result = await updateOrderStatus(orderId, newStatus as any)
            if (result.success) {
                router.refresh()
            } else {
                alert('Erreur lors de la mise à jour: ' + result.error)
            }
        } catch (e) {
            alert('Une erreur est survenue')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-bold ${currentStage.color} border-transparent hover:border-current`}
                disabled={isUpdating}
            >
                {isUpdating ? 'Mise à jour...' : currentStage.label}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                    {STAGES.map((stage) => (
                        <button
                            key={stage.value}
                            onClick={() => handleUpdate(stage.value)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${currentStatus === stage.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                                }`}
                        >
                            <span className={`px-2 py-0.5 rounded-full text-xs ${stage.color}`}>{stage.label}</span>
                            {currentStatus === stage.value && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
