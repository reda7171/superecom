'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Book } from 'lucide-react'
import { addToReadingList } from '@/lib/actions/reading-list'
import { useUIStore } from '@/store/ui'
import { ReadingStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'

export default function AddManualBookReadingList() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { showNotification } = useUIStore()
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        totalPages: 200,
        status: ReadingStatus.TO_READ as ReadingStatus
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await addToReadingList({
                title: formData.title,
                author: formData.author,
                totalPages: Number(formData.totalPages),
                status: formData.status,
                cover: '' // No cover for manual books for now or we could add a placeholder
            })

            if (result.success) {
                showNotification(result.message || 'Livre ajouté à votre liste !', 'success')
                setIsOpen(false)
                setFormData({ title: '', author: '', totalPages: 200, status: ReadingStatus.TO_READ })
                router.refresh()
            } else {
                if (result.error === 'Vous devez être connecté') {
                    showNotification("Veuillez vous connecter pour ajouter un livre", 'error')
                } else {
                    showNotification(result.error || 'Une erreur est survenue', 'error')
                }
            }
        } catch (error) {
            showNotification('Erreur lors de l\'ajout', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mb-8">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter un livre hors catalogue
                </button>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <Book className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="font-black text-xl text-black">Nouveau livre personnel</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Titre</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: L'Alchimiste"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Auteur</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Paulo Coelho"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Pages totales</label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.totalPages}
                                onChange={(e) => setFormData({ ...formData, totalPages: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Ajouter à ma liste
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
