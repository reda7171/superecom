'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Save, Package, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function NewAccessoryPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultCategory = searchParams.get('category')?.toUpperCase() || 'BOOKMARK'

    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '0',
        image: '',
        category: defaultCategory,
        active: true
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await fetch('/api/admin/accessories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push(`/${locale}/admin/accessories`)
                router.refresh()
            } else {
                const err = await res.json()
                alert(`Erreur: ${err.error}`)
            }
        } catch (err) {
            alert('Erreur technique')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${locale}/admin/accessories`}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Produit</h1>
                        <p className="text-sm font-medium text-slate-500">Ajouter un accessoire ou gadget</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom du produit</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                placeholder="Ex: Marque-page Cuir"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Détails sur le produit..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prix de vente (DH)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Coût de revient (DH)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.costPrice}
                                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                            >
                                <option value="BOOKMARK">Marque-page</option>
                                <option value="LIBRARY">Bibliothèque</option>
                                <option value="USB">Clé USB</option>
                                <option value="ACCESSORY">Autre accessoire</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock initial</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL de l'image</label>
                            <div className="relative group">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                    >
                        {isSaving ? 'Enregistrement...' : <><Save className="w-5 h-5 mr-3" /> Enregistrer le produit</>}
                    </button>
                </div>
            </form>
        </div>
    )
}
