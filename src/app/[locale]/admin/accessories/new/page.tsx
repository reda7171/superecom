'use client'

import { useState, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Save, Image as ImageIcon, Upload, Link2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NewAccessoryPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultCategory = searchParams.get('category')?.toUpperCase() || 'BOOKMARK'

    const [isSaving, setIsSaving] = useState(false)
    const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '0',
        image: '',
        category: defaultCategory,
        materials: '',
        dimensions: '',
        weight: '',
        warranty: '',
        active: true
    })

    /* Upload fichier vers /api/admin/upload */
    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        try {
            const data = new FormData()
            data.append('file', file)
            const res = await fetch('/api/admin/upload', { method: 'POST', body: data })
            if (res.ok) {
                const json = await res.json()
                setFormData(prev => ({ ...prev, image: json.url }))
            } else {
                alert('Erreur upload')
            }
        } finally {
            setIsUploading(false)
        }
    }

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
                                <option value="FURNITURE">Fourniture bureau</option>
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

                        {/* Image : onglets Upload / URL */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Image</label>

                            {/* Onglets */}
                            <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setImageTab('upload')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all ${
                                        imageTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                                >
                                    <Upload className="w-3.5 h-3.5" /> Uploader
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageTab('url')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all ${
                                        imageTab === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                                >
                                    <Link2 className="w-3.5 h-3.5" /> URL
                                </button>
                            </div>

                            {imageTab === 'upload' ? (
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-50"
                                    >
                                        <Upload className="w-6 h-6" />
                                        <span className="text-xs font-bold">
                                            {isUploading ? 'Upload en cours...' : 'Cliquer pour choisir un fichier'}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            {/* Preview */}
                            {formData.image && (
                                <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-100">
                                    <Image src={formData.image} alt="preview" fill className="object-cover" unoptimized />
                                </div>
                            )}
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
