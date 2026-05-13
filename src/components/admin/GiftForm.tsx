'use client'

import { useState } from 'react'
import { createGift } from '@/lib/actions/gifts'
import { uploadGiftImage } from '@/lib/actions/upload'
import { useRouter } from 'next/navigation'
import { Gift, Plus, Loader2 } from 'lucide-react'
import ImageInput from './ImageInput'

export default function GiftForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        
        let imageUrl = formData.get('image') as string

        // Gérer l'upload si un fichier est présent
        const imageFile = formData.get('imageFile') as File
        if (imageFile && imageFile.size > 0) {
            const uploadFormData = new FormData()
            uploadFormData.append('image', imageFile)
            const uploadRes = await uploadGiftImage(uploadFormData)
            if (uploadRes.success && uploadRes.imageUrl) {
                imageUrl = uploadRes.imageUrl
            } else if (!uploadRes.success) {
                alert(uploadRes.error)
                setIsLoading(false)
                return
            }
        }

        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string) || 0,
            minAmount: parseFloat(formData.get('minAmount') as string) || 0,
            image: imageUrl || null,
            active: true,
        }

        const res = await createGift(data)
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
                Nouveau Cadeau
            </h2>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Nom du cadeau</label>
                    <div className="relative">
                        <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="name"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none placeholder:italic"
                            placeholder="Ex: Marque-page Cuir"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500">Valeur (Prix affiché)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500">Montant Min. Déblocage</label>
                        <input
                            name="minAmount"
                            type="number"
                            step="0.01"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Image du cadeau</label>
                    <ImageInput />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none placeholder:italic resize-none"
                        placeholder="Détails sur l'offre..."
                    ></textarea>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Enregistrer le cadeau
            </button>
        </form>
    )
}
