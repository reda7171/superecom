'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, SlidersHorizontal, Users, MapPin, ShoppingBag } from 'lucide-react'

interface CustomerFiltersProps {
    search: string
    setSearch: (val: string) => void
    totalCount: number
    onAddCustomer: () => void
}

export default function CustomerFilters({
    search,
    setSearch,
    totalCount,
    onAddCustomer
}: CustomerFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)

    const hasActiveFilters = search.length > 0

    return (
        <div className="w-full space-y-4">
            {/* Toggle Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            isOpen || hasActiveFilters
                            ? 'bg-black text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Search className="w-4 h-4" />
                        {isOpen ? 'Fermer la recherche' : 'Rechercher un lecteur'}
                    </button>
                    
                    {hasActiveFilters && (
                        <button
                            onClick={() => setSearch('')}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Effacer
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        {totalCount} Lecteurs inscrits
                    </div>
                    <button 
                        onClick={onAddCustomer}
                        className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-100 transition-all active:scale-95"
                    >
                        <Users className="w-4 h-4" />
                        Nouveau
                    </button>
                </div>
            </div>

            {/* Search Panel */}
            {isOpen && (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <Search className="w-3 h-3" />
                            Filtrer la base de données
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, téléphone, ville ou email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-bold text-lg"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium italic text-center">
                            La recherche est instantanée et s'applique sur tous les champs du profil client.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
