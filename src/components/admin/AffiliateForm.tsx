'use client'

import { useState } from 'react'
import { createAffiliate } from '@/lib/actions/affiliates'
import { useRouter } from 'next/navigation'
import { Tag, Plus, Loader2, User, Mail, Lock } from 'lucide-react'

export default function AffiliateForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            code: formData.get('code') as string,
            affiliateName: formData.get('affiliateName') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            commission: parseFloat(formData.get('commission') as string),
            discount: parseFloat(formData.get('discount') as string),
            type: formData.get('type') as 'PERCENTAGE' | 'FIXED_AMOUNT',
            isActive: true,
        }

        const res = await createAffiliate(data)
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
                <Plus className="w-5 h-5 text-indigo-600" />
                Nouvel Affilié
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase text-gray-500">Nom de l'Influenceur</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="affiliateName"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ex: Amine Amin"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Email (Connexion)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="amine@gmail.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="******"
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase text-gray-500">Code Promo (ex: AMINE10)</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="code"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase placeholder:italic"
                            placeholder="AMINE10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Type de commission / remise</label>
                    <select name="type" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="PERCENTAGE">Pourcentage (%)</option>
                        <option value="FIXED_AMOUNT">Montant fixe (MAD)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Remise Client</label>
                    <input
                        name="discount"
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Commission Influenceur</label>
                    <input
                        name="commission"
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="15"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Enregistrer l'affilié
            </button>
        </form>
    )
}
