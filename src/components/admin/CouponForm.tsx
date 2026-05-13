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
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 space-y-8">
            <div>
                <h2 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
                    Nouveau<span className="text-blue-600">.</span>
                </h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Générer un code de réduction</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Code Promo</label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="code"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-black text-black focus:bg-white focus:border-black outline-none uppercase placeholder:italic transition-all"
                            placeholder="RIWAYA10"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Type de remise</label>
                    <select name="type" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-black text-black focus:bg-white focus:border-black outline-none transition-all appearance-none">
                        <option value="PERCENTAGE">Pourcentage (%)</option>
                        <option value="FIXED_AMOUNT">Montant fixe (MAD)</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Valeur</label>
                        <input
                            name="discount"
                            type="number"
                            required
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-black text-black focus:bg-white focus:border-black outline-none transition-all"
                            placeholder="10"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Min. Achat</label>
                        <input
                            name="minAmount"
                            type="number"
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-black text-black focus:bg-white focus:border-black outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-[10px]"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Activer le coupon
            </button>
        </form>
    )
}
