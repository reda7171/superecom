'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Save, Upload, Info, AlertTriangle } from 'lucide-react'
import { createSellerBook } from '@/lib/actions/seller/dashboard'

export default function NewSellerBookPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        const data = {
            title: formData.get('title') as string,
            author: formData.get('author') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            image: formData.get('image') as string,
            category: formData.get('category') as string,
            language: formData.get('language') as string || 'fr',
        }

        const res = await createSellerBook(data)

        if (res.success) {
            router.push('/seller/books')
            router.refresh()
        } else {
            setError("Une erreur est survenue lors de l'ajout.")
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link 
                    href="/seller/books" 
                    className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                </Link>
                <h1 className="text-4xl font-black text-black tracking-tighter uppercase tracking-tight">Vendre un nouveau livre</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-4 text-red-600 font-bold animate-pulse">
                    <AlertTriangle className="w-6 h-6" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Section 1: Image & Infos de base */}
                <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-xl shadow-black/5 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Image Preview / Input */}
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Image du livre</label>
                        <div className="aspect-[3/4] bg-gray-50 rounded-3xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-6 group hover:border-black/10 transition-all">
                            <Upload className="w-10 h-10 text-gray-200 mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-snug">Glissez une image ou collez un lien URL</p>
                        </div>
                        <input 
                            name="image" 
                            type="url" 
                            required 
                            placeholder="https://image-url.jpg"
                            className="w-full mt-4 px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-black outline-none"
                        />
                    </div>

                    {/* Basic Infos */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Titre du livre *</label>
                            <input 
                                name="title" 
                                type="text" 
                                required 
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-black text-black focus:ring-2 focus:ring-black outline-none placeholder-gray-200"
                                placeholder="Atomic Habits"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Auteur *</label>
                            <input 
                                name="author" 
                                type="text" 
                                required 
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-black outline-none placeholder-gray-200"
                                placeholder="James Clear"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Catégorie</label>
                                <select 
                                    name="category"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-black outline-none appearance-none"
                                >
                                    <option value="Développement Personnel">Développement Personnel</option>
                                    <option value="Business & Finance">Business & Finance</option>
                                    <option value="Productivité">Productivité</option>
                                    <option value="Psychologie">Psychologie</option>
                                    <option value="Fiction">Fiction</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Langue</label>
                                <select 
                                    name="language"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-black outline-none appearance-none"
                                >
                                    <option value="fr">Français</option>
                                    <option value="ar">Arabe</option>
                                    <option value="en">Anglais</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Prix & Stock */}
                <div className="bg-black text-white rounded-[3rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-pixio-yellow/10 blur-3xl rounded-full" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Prix de vente (MAD) *</label>
                            <div className="relative">
                                <input 
                                    name="price" 
                                    type="number" 
                                    step="0.01"
                                    required 
                                    className="w-full px-8 py-6 bg-white/10 border-2 border-white/5 rounded-[2rem] text-3xl font-black text-white focus:bg-white/20 focus:border-pixio-yellow outline-none transition-all placeholder-white/10"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-pixio-yellow">MAD</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Quantité en Stock *</label>
                            <input 
                                name="stock" 
                                type="number" 
                                required 
                                className="w-full px-8 py-6 bg-white/10 border-2 border-white/5 rounded-[2rem] text-3xl font-black text-white focus:bg-white/20 focus:border-pixio-yellow outline-none transition-all placeholder-white/10"
                                placeholder="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Description */}
                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl shadow-black/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Description détaillée *</label>
                    <textarea 
                        name="description" 
                        required 
                        rows={6}
                        className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2rem] text-sm font-medium text-black focus:ring-2 focus:ring-black outline-none placeholder-gray-200 resize-none"
                        placeholder="Parlez-nous de ce livre (état, édition, contenu)..."
                    />
                    
                    <div className="mt-10 p-6 bg-blue-50/50 rounded-2xl flex items-start gap-4">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                        <p className="text-xs font-medium text-blue-700 leading-relaxed">
                            En publiant ce livre, il sera immédiatement visible sur le Marketplace de Riwaya. 
                            Veillez à ce que les informations soient exactes pour éviter tout litige lors de la livraison.
                        </p>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-12 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-widest flex items-center gap-4 hover:bg-pixio-yellow hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Publication en cours...' : 'Publier sur le Marketplace'}
                        {!loading && <Save className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
    )
}
