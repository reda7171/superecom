'use client'

import { useState, useEffect } from 'react'
import { createExpense, updateExpense } from '@/lib/actions/finance'
import { ExpenseCategory } from '@prisma/client'
import { Plus, Loader2, Calculator, Edit2 } from 'lucide-react'

const CATEGORIES = [
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'ADS', label: 'Publicité (Ads)' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'BOOKS_PURCHASE', label: 'Achat Livres' },
    { value: 'PACKAGING', label: 'Emballage' },
    { value: 'SALARIES', label: 'Salaires' },
    { value: 'OFFICE', label: 'Bureau & Fournitures' },
    { value: 'GIFTS', label: 'Cadeaux' },
    { value: 'CASHOUT', label: 'Cash out' },
    { value: 'OTHER', label: 'Autre' }
]

export default function ExpenseForm({ expense }: { expense?: any }) {
    const isEditing = !!expense
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>(expense?.category || 'TRANSPORT')
    const [isLot, setIsLot] = useState(!!expense?.unitCost)

    // Form fields
    const [title, setTitle] = useState(expense?.title || '')
    const [amount, setAmount] = useState<number | string>(expense?.amount || '')
    const [description, setDescription] = useState(expense?.description || '')

    // Calculs pour les lots
    const [bookCount, setBookCount] = useState<number | string>('')
    const [booksCost, setBooksCost] = useState<number | string>('')
    const [transportCost, setTransportCost] = useState<number | string>(0)

    const totalLotCost = (Number(booksCost) || 0) + (Number(transportCost) || 0)
    const averagePrice = Number(bookCount) > 0 ? (totalLotCost / Number(bookCount)) : 0

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        
        let finalAmount = parseFloat(amount as string)
        let finalDescription = description

        if (selectedCategory === 'BOOKS_PURCHASE' && isLot && bookCount && booksCost) {
            finalAmount = totalLotCost
            const lotDetails = `Lot de ${bookCount} livres. Prix moyen de revient: ${averagePrice.toFixed(2)} MAD/livre. (Livres: ${booksCost || 0} MAD, Transport: ${transportCost || 0} MAD).`
            finalDescription = description ? `${lotDetails} | ${description}` : lotDetails
        }

        const data = {
            title,
            amount: finalAmount,
            category: selectedCategory as ExpenseCategory,
            description: finalDescription,
            unitCost: (isLot && averagePrice > 0) ? averagePrice : (expense?.unitCost || undefined)
        }

        if (isEditing) {
            await updateExpense(expense.id, data)
        } else {
            await createExpense(data)
            setTitle('')
            setAmount('')
            setDescription('')
            setSelectedCategory('TRANSPORT')
            setIsLot(false)
            setBookCount('')
            setBooksCost('')
            setTransportCost(0)
        }
        
        setLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        if (isEditing) {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 bg-white rounded-lg border border-blue-100 transition shadow-sm"
                    title="Modifier"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            )
        }

        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
                <Plus className="w-4 h-4" />
                Nouvelle Dépense
            </button>
        )
    }

    const formContent = (
        <>
            <h3 className="font-bold text-lg mb-4 text-gray-800">{isEditing ? 'Modifier la dépense' : 'Ajouter une dépense'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Titre</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Livraison Rabat" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                        <select 
                            value={selectedCategory} 
                            onChange={e => setSelectedCategory(e.target.value)}
                            required 
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Achat Livres - Option Lot */}
                    {selectedCategory === 'BOOKS_PURCHASE' && (
                        <div className="md:col-span-2 bg-blue-50 p-4 border border-blue-100 rounded-xl space-y-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isLot}
                                    onChange={(e) => setIsLot(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                                />
                                <span className="font-bold text-blue-900">Il s'agit d'un achat de lot avec calcul du prix de revient</span>
                            </label>

                            {isLot && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 mb-1">Quantité (Nb de livres)</label>
                                        <input 
                                            type="number" 
                                            value={bookCount}
                                            onChange={(e) => setBookCount(e.target.value)}
                                            required={isLot}
                                            min="1"
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm" 
                                            placeholder="Ex: 50" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 mb-1">Prix global des livres (MAD)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={booksCost}
                                            onChange={(e) => setBooksCost(e.target.value)}
                                            required={isLot}
                                            min="0"
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm" 
                                            placeholder="Ex: 1500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 mb-1">Frais de transport (MAD)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={transportCost}
                                            onChange={(e) => setTransportCost(e.target.value)}
                                            min="0"
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm" 
                                            placeholder="Ex: 50" 
                                        />
                                    </div>

                                    {/* Résultat Calcul */}
                                    <div className="sm:col-span-3 bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                            <Calculator className="w-4 h-4" />
                                            Coût Total: {totalLotCost.toFixed(2)} MAD
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Prix de revient unitaire</span>
                                            <p className="text-lg font-black text-green-600">{averagePrice.toFixed(2)} MAD <span className="text-xs text-green-500 font-medium tracking-normal">/ livre</span></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(!isLot || selectedCategory !== 'BOOKS_PURCHASE') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Montant Total (MAD)</label>
                            <input 
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                type="number" 
                                step="0.01" 
                                required={!isLot}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                placeholder="0.00" 
                            />
                        </div>
                    )}

                    <div className={isLot && selectedCategory === 'BOOKS_PURCHASE' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optionnel)</label>
                        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Détails supplémentaires..." />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-bold shadow-sm"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEditing ? 'Mettre à jour' : 'Enregistrer la dépense'}
                    </button>
                </div>
            </form>
        </>
    )

    if (isEditing) {
        return (
            isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {formContent}
                    </div>
                </div>
            ) : null
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            {formContent}
        </div>
    )
}
