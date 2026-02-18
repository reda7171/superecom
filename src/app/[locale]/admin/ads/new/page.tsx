'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAd } from '@/lib/actions/advertisements'
import { AdPlacement } from '@prisma/client'
import { Upload, Loader2 } from 'lucide-react'

const PLACEMENT_OPTIONS: { value: AdPlacement; label: string }[] = [
    { value: 'HOMEPAGE_TOP', label: 'Page d\'accueil - Haut' },
    { value: 'HOMEPAGE_MIDDLE', label: 'Page d\'accueil - Milieu' },
    { value: 'HOMEPAGE_BOTTOM', label: 'Page d\'accueil - Bas' },
    { value: 'SIDEBAR', label: 'Barre latérale' },
    { value: 'BETWEEN_PRODUCTS', label: 'Entre les produits' },
    { value: 'BOOK_PAGE', label: 'Page livre' },
    { value: 'CHECKOUT', label: 'Checkout' },
    { value: 'FOOTER', label: 'Footer' },
]

export default function NewAdPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [imageUrl, setImageUrl] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        placement: 'HOMEPAGE_TOP' as AdPlacement,
        isActive: false,
        priority: 0,
        startDate: '',
        endDate: '',
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            setImageUrl(data.url)
            setFormData(prev => ({ ...prev, image: data.url }))
        } catch (error) {
            console.error('Upload error:', error)
            alert('Erreur lors de l\'upload de l\'image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createAd({
                title: formData.title,
                image: formData.image,
                link: formData.link || undefined,
                placement: formData.placement,
                isActive: formData.isActive,
                priority: formData.priority,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
            })

            router.push('/admin/ads')
            router.refresh()
        } catch (error) {
            console.error('Error creating ad:', error)
            alert('Erreur lors de la création de la publicité')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-black mb-8">Nouvelle publicité</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 border border-gray-100">
                {/* Titre */}
                <div>
                    <label className="block text-sm font-bold text-black mb-2">
                        Titre *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        placeholder="Ex: Promotion spéciale livres"
                    />
                </div>

                {/* Image */}
                <div>
                    <label className="block text-sm font-bold text-black mb-2">
                        Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                        {imageUrl ? (
                            <div className="space-y-4">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-h-64 mx-auto rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageUrl('')
                                        setFormData({ ...formData, image: '' })
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 font-bold"
                                >
                                    Changer l'image
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-4">
                                    {uploading ? (
                                        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                                    ) : (
                                        <Upload className="w-12 h-12 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="font-bold text-black">Cliquez pour uploader</p>
                                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, WebP (max 5MB)</p>
                                    </div>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* Lien */}
                <div>
                    <label className="block text-sm font-bold text-black mb-2">
                        Lien (optionnel)
                    </label>
                    <input
                        type="url"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        placeholder="https://example.com"
                    />
                </div>

                {/* Emplacement */}
                <div>
                    <label className="block text-sm font-bold text-black mb-2">
                        Emplacement *
                    </label>
                    <select
                        required
                        value={formData.placement}
                        onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    >
                        {PLACEMENT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priorité */}
                <div>
                    <label className="block text-sm font-bold text-black mb-2">
                        Priorité
                    </label>
                    <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Plus la priorité est élevée, plus la pub sera affichée en premier</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Date de début
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Date de fin
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        />
                    </div>
                </div>

                {/* Active */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-black">
                        Activer immédiatement
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.image}
                        className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Créer la publicité
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 bg-gray-100 text-black rounded-full hover:bg-gray-200 transition-colors font-bold"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    )
}
