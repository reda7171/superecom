'use client'

import { useState, useEffect } from 'react'
import {
    getAllCategories,
    getCategoryConfigs,
    updateCategoryBadge,
    toggleCategoryPin
} from '@/lib/actions/admin-categories'
import {
    Pin,
    PinOff,
    Tag,
    Clock,
    TrendingUp,
    Plus,
    Trash2,
    Calendar,
    Save,
    Search
} from 'lucide-react'

export default function MarketingPage() {
    const [categories, setCategories] = useState<string[]>([])
    const [configs, setConfigs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setIsLoading(true)
        const [cats, confs] = await Promise.all([
            getAllCategories(),
            getCategoryConfigs()
        ])
        setCategories(cats)
        setConfigs(confs)
        setIsLoading(false)
    }

    const handleUpdateBadge = async (name: string, badge: string | null, days: number = 0, color: string | null = null) => {
        let expiresAt = null
        if (days > 0) {
            expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + days)
        }
        await updateCategoryBadge(name, badge, expiresAt, color)
        loadData()
    }

    const handleTogglePin = async (name: string) => {
        await toggleCategoryPin(name)
        loadData()
    }

    const filteredCategories = categories.filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[400px]">Chargement...</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Marketing des Catégories</h2>
                <p className="text-gray-500 font-medium">Gérez la visibilité et les badges de vos thèmes dans la recherche.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Filtrer les catégories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => {
                    const config = configs.find(c => c.name === cat)
                    const isPinned = config?.isPinned || false
                    const currentBadge = config?.badge || null

                    return (
                        <div key={cat} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            {/* Pin Indicator */}
                            {isPinned && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-bl-2xl">
                                    <Pin className="w-4 h-4" />
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{cat}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        Configuration Marketing
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    {/* Pining */}
                                    <button
                                        onClick={() => handleTogglePin(cat)}
                                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${isPinned ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <span className="text-xs font-black uppercase">Épingler en tête</span>
                                        {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                                    </button>

                                    {/* Badges */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleUpdateBadge(cat, 'PROMO', 3, '#f97316')}
                                            className={`p-3 rounded-2xl border transition-all text-center ${currentBadge === 'PROMO' && config?.badgeColor === '#f97316' ? 'bg-orange-500 text-white border-orange-600 shadow-lg' : 'bg-white border-gray-100 hover:border-orange-400 text-gray-600'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase leading-tight text-left block">Promo Flash (3j)</span>
                                            <div className="w-4 h-1 bg-orange-500 rounded-full mt-1"></div>
                                        </button>

                                        <button
                                            onClick={() => handleUpdateBadge(cat, 'RARE', 0, '#8b5cf6')}
                                            className={`p-3 rounded-2xl border transition-all text-center ${currentBadge === 'RARE' ? 'bg-violet-500 text-white border-violet-600 shadow-lg shadow-violet-200' : 'bg-white border-gray-100 hover:border-violet-400 text-gray-600'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase leading-tight text-left block">Badge Rare</span>
                                            <div className="w-4 h-1 bg-violet-500 rounded-full mt-1"></div>
                                        </button>

                                        <button
                                            onClick={() => handleUpdateBadge(cat, 'EXCLUSIF', 0, '#2563eb')}
                                            className={`p-3 rounded-2xl border transition-all text-center ${currentBadge === 'EXCLUSIF' ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-200' : 'bg-white border-gray-100 hover:border-blue-400 text-gray-600'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase leading-tight text-left block">Exclusivité</span>
                                            <div className="w-4 h-1 bg-blue-600 rounded-full mt-1"></div>
                                        </button>

                                        <button
                                            onClick={() => handleUpdateBadge(cat, 'NEW', 7, '#10b981')}
                                            className={`p-3 rounded-2xl border transition-all text-center ${currentBadge === 'NEW' ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-200' : 'bg-white border-gray-100 hover:border-green-400 text-gray-600'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase leading-tight text-left block">New (1 sem)</span>
                                            <div className="w-4 h-1 bg-green-500 rounded-full mt-1"></div>
                                        </button>

                                        <button
                                            onClick={() => handleUpdateBadge(cat, null)}
                                            className="p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all text-center group/reset col-span-2"
                                        >
                                            <span className="text-[10px] font-black uppercase">Supprimer le badge</span>
                                        </button>
                                    </div>

                                    {/* Expiration Info */}
                                    {config?.badgeExpiresAt && (
                                        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-2xl text-orange-700">
                                            <Calendar className="w-4 h-4" />
                                            <p className="text-[10px] font-bold uppercase">
                                                Expire le: {new Date(config.badgeExpiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
