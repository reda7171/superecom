'use client'

import { useState } from 'react'
import { X, Save, Loader2, Edit3 } from 'lucide-react'
import { updateOrderDetails } from '@/lib/actions/admin-orders'
import { useUIStore } from '@/store/ui'
import { useRouter } from 'next/navigation'

interface OrderEditModalProps {
    order: {
        id: string
        fullName: string
        phone: string
        address: string
        city: string
        total: number
        comment?: string | null
    }
}

export default function OrderEditModal({ order }: OrderEditModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { showNotification } = useUIStore()
    const router = useRouter()

    const [form, setForm] = useState({
        fullName: order.fullName,
        phone: order.phone,
        address: order.address,
        city: order.city,
        total: order.total,
        comment: order.comment || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await updateOrderDetails(order.id, {
                ...form,
                total: Number(form.total)
            })
            if (result.success) {
                showNotification('Commande modifiée avec succès', 'success')
                setIsOpen(false)
                router.refresh()
            } else {
                showNotification(result.error || 'Erreur lors de la modification', 'error')
            }
        } catch {
            showNotification('Erreur inattendue', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
            >
                <Edit3 className="w-4 h-4" />
                Modifier la commande
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-black text-gray-900">Modifier la commande</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Nom complet</label>
                                    <input
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Téléphone</label>
                                    <input
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Ville</label>
                                    <input
                                        value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Adresse</label>
                                    <input
                                        value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Total (MAD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.total}
                                        onChange={e => setForm({ ...form, total: Number(e.target.value) })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Commentaire</label>
                                    <textarea
                                        value={form.comment}
                                        onChange={e => setForm({ ...form, comment: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
