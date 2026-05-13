'use client'

import { useState, useEffect } from 'react'
import { usePathname } from '@/i18n/routing'
import { Search, Filter, X, ChevronDown, SlidersHorizontal, BookOpen, Usb, Baby } from 'lucide-react'
import Link from 'next/link'

interface OrderFiltersProps {
    locale: string
    statusLabels: Record<string, string>
    currentStatus?: string
    searchTerm: string
    onSearchChange: (val: string) => void
    totalCount: number
}

export default function OrderFilters({
    locale,
    statusLabels,
    currentStatus,
    searchTerm,
    onSearchChange,
    totalCount
}: OrderFiltersProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const hasActiveFilters = currentStatus || searchTerm

    return (
        <div className="w-full space-y-4">
            {/* Toggle Button */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
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
                        {isOpen ? 'Fermer la recherche' : 'Recherche & Filtres'}
                    </button>
                    
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                onSearchChange('')
                                // Navigation to clear status is handled by links or parent, 
                                // but for simplicity we keep it as is or could add a reset link
                            }}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Réinitialiser
                        </button>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    {totalCount} Commandes
                </div>
            </div>

            {/* Filters Panel */}
            {isOpen && (
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Search */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <Search className="w-3 h-3" />
                                Recherche rapide
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Nom, téléphone, ville, ID..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <Filter className="w-3 h-3" />
                                Catégories de vente
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href={`/${locale}/admin/orders`}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all border ${
                                        pathname === `/${locale}/admin/orders` || pathname === `/admin/orders`
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                        : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" /> Livres
                                </Link>
                                <Link
                                    href={`/${locale}/admin/orders/usb`}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-100 text-teal-700 rounded-xl font-bold text-xs transition-all hover:bg-teal-50"
                                >
                                    <Usb className="w-3.5 h-3.5" /> USB
                                </Link>
                                <Link
                                    href={`/${locale}/admin/orders/kids`}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-100 text-pink-700 rounded-xl font-bold text-xs transition-all hover:bg-pink-50"
                                >
                                    <Baby className="w-3.5 h-3.5" /> Enfants
                                </Link>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-3 lg:col-span-1">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <SlidersHorizontal className="w-3 h-3" />
                                Filtrer par Statut
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={`/${locale}/admin/orders`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        !currentStatus 
                                        ? 'bg-black text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    Tout
                                </Link>
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <Link
                                        key={key}
                                        href={`/${locale}/admin/orders?status=${key}`}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            currentStatus === key 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
