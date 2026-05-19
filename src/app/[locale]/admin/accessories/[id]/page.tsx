'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Trash2, Package, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function EditAccessoryPage({ 
    params 
}: { 
    params: Promise<{ locale: string, id: string }> 
}) {
    const { locale, id } = use(params)
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '0',
        image: '',
        category: 'BOOKMARK',
        materials: '',
        dimensions: '',
        weight: '',
        warranty: '',
        active: true
    })

    useEffect(() => {
        fetch(`/api/admin/accessories/${id}`)
            .then(res => res.json())
            .then(data => {
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    price: data.price.toString(),
                    costPrice: data.costPrice.toString(),
                    stock: data.stock.toString(),
                    image: data.image || '',
                    category: data.category,
                    materials: data.materials || '',
                    dimensions: data.dimensions || '',
                    weight: data.weight || '',
                    warranty: data.warranty || '',
                    active: data.active
                })
                setIsLoading(false)
            })
            .catch(() => {
                alert('Erreur lors du chargement')
                router.push(`/${locale}/admin/accessories`)
            })
    }, [id, locale, router])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await fetch(`/api/admin/accessories/${id}`, {
                method: 'PATCH',
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

    if (isLoading) return <div className="p-20 text-center font-bold text-slate-400">Chargement...</div>

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
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Modifier Produit</h1>
                        <p className="text-sm font-medium text-slate-500">{formData.name}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Caractéristiques techniques (Optionnel)</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Matériaux / Matière</label>
                                <input
                                    type="text"
                                    value={formData.materials}
                                    onChange={e => setFormData({ ...formData, materials: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                    placeholder="Ex: Cuir véritable / Métal"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dimensions</label>
                                <input
                                    type="text"
                                    value={formData.dimensions}
                                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                    placeholder="Ex: 12 x 3 cm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Poids / Capacité</label>
                                <input
                                    type="text"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                    placeholder="Ex: 64 Go / 150g"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Garantie</label>
                                <input
                                    type="text"
                                    value={formData.warranty}
                                    onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                    placeholder="Ex: 1 an"
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                                className={`w-full py-3 rounded-xl text-sm font-bold border transition-all ${
                                    formData.active 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                            >
                                {formData.active ? 'Produit Actif' : 'Produit Inactif'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                    >
                        {isSaving ? 'Enregistrement...' : <><Save className="w-5 h-5 mr-3" /> Mettre à jour</>}
                    </button>
                </div>
            </form>
        </div>
    )
}
