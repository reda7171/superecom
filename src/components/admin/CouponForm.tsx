'use client'

import { useState } from 'react'
import { createCoupon } from '@/lib/actions/coupons'
import { useRouter } from 'next/navigation'
import { Tag, Plus, Loader2 } from 'lucide-react'

export default function CouponForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            code: formData.get('code') as string,
            discount: parseFloat(formData.get('discount') as string),
            type: formData.get('type') as 'PERCENTAGE' | 'FIXED_AMOUNT',
            minAmount: formData.get('minAmount') ? parseFloat(formData.get('minAmount') as string) : null,
            isActive: true,
        }

        const res = await createCoupon(data)
        setIsLoading(false)

        if (res.success) {
            (e.target as HTMLFormElement).reset()
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Nouveau Coupon
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Code Promo (ex: RIWAYA10)</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="code"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase placeholder:italic"
                            placeholder="RIWAYA10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Type de remise</label>
                    <select name="type" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="PERCENTAGE">Pourcentage (%)</option>
                        <option value="FIXED_AMOUNT">Montant fixe (MAD)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Valeur de la remise</label>
                    <input
                        name="discount"
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Minimum d'achat (Optionnel)</label>
                    <input
                        name="minAmount"
                        type="number"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Enregistrer le coupon
            </button>
        </form>
    )
}
