'use client'

import { useState } from 'react'
import { createExpense } from '@/lib/actions/finance'
import { ExpenseCategory } from '@prisma/client'
import { Plus, Loader2 } from 'lucide-react'

const CATEGORIES = [
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'ADS', label: 'Publicité (Ads)' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'BOOKS_PURCHASE', label: 'Achat Livres' },
    { value: 'PACKAGING', label: 'Emballage' },
    { value: 'SALARIES', label: 'Salaires' },
    { value: 'OFFICE', label: 'Bureau & Fournitures' },
    { value: 'OTHER', label: 'Autre' }
]

export default function ExpenseForm() {
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const title = formData.get('title') as string
        const amount = parseFloat(formData.get('amount') as string)
        const category = formData.get('category') as ExpenseCategory
        const description = formData.get('description') as string

        await createExpense({ title, amount, category, description })
        setLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                <Plus className="w-4 h-4" />
                Nouvelle Dépense
            </button>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <h3 className="font-bold text-lg mb-4">Ajouter une dépense</h3>
            <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input name="title" required className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Livraison Rabat" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                        <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select name="category" required className="w-full px-3 py-2 border rounded-lg">
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optionnel)</label>
                        <input name="description" className="w-full px-3 py-2 border rounded-lg" placeholder="Détails supplémentaires..." />
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    )
}
