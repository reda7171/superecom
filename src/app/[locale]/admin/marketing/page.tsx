'use client'

import { useState, useEffect } from 'react'
import { 
    Sparkles, 
    Image as ImageIcon, 
    Trash2, 
    Download, 
    Eye, 
    RefreshCcw,
    Search,
    Filter,
    Calendar,
    ExternalLink,
    Quote,
    Facebook,
    Instagram,
    Music,
    Send,
    X
} from 'lucide-react'
import Image from 'next/image'

interface Asset {
    name: string
    url: string
    type: string
    bookId?: string
    packId?: string
    createdAt: string
}

export default function MarketingPage() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState<'all' | 'creative' | 'pack' | 'desc'>('all')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const fetchAssets = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/marketing/assets')
            const data = await res.json()
            if (data.success) {
                setAssets(data.assets)
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleDelete = async (filename: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

        try {
            const res = await fetch('/api/admin/marketing/assets/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            })
            const data = await res.json()
            if (data.success) {
                setAssets(prev => prev.filter(a => a.name !== filename))
            } else {
                alert(data.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            alert('Erreur technique lors de la suppression')
        }
    }

    const handlePublish = async (asset: Asset, platform: string) => {
        try {
            const res = await fetch('/api/n8n/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: platform === 'all' ? 'both' : platform,
                    customImageUrl: asset.url,
                    bookId: asset.bookId,
                    packId: asset.packId,
                    isPack: asset.type === 'PACK',
                    isDescription: asset.type === 'DESCRIPTION'
                })
            })
            const data = await res.json()
            if (data.success) alert('✅ Envoyé à n8n pour publication')
            else alert(`❌ Erreur: ${data.message || data.error}`)
        } catch (error) {
            alert('Erreur technique lors de la publication')
        }
    }

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'creative' && asset.name.includes('creative')) ||
            (filter === 'pack' && asset.name.includes('pack')) ||
            (filter === 'desc' && asset.name.includes('desc'))
        
        return matchesSearch && matchesFilter
    })

    const FilterButtons = ({ isMobile = false }) => (
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'gap-2 overflow-x-auto pb-2 md:pb-0'}`}>
            {[
                { id: 'all', label: 'Toutes', icon: ImageIcon },
                { id: 'creative', label: 'Publicités', icon: Sparkles },
                { id: 'pack', label: 'Packs', icon: Filter },
                { id: 'desc', label: 'Descriptions', icon: Quote }
            ].map((btn) => (
                <button
                    key={btn.id}
                    onClick={() => {
                        setFilter(btn.id as any)
                        if (isMobile) setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                        filter === btn.id 
                            ? 'bg-black text-white shadow-lg shadow-black/10' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <btn.icon className="w-4 h-4" />
                    {btn.label}
                </button>
            ))}
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Desktop Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        Marketing & Créatives
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Retrouvez toutes les images générées pour vos campagnes publicitaires.</p>
                </div>

                <button 
                    onClick={fetchAssets}
                    className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {/* Sticky Mobile Search Bar */}
            <div className={`lg:hidden fixed left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'top-16' : 'top-[64px]'}`}>
                <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Rechercher créatives..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-900 focus:ring-0 appearance-none"
                        />
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className={`p-2 rounded-xl transition-all ${filter !== 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={fetchAssets}
                        className="p-2 bg-gray-100 rounded-xl text-gray-900"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Desktop Filters & Search */}
            <div className="hidden lg:flex bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Rechercher une créative..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-black font-bold text-slate-900 outline-none transition-all"
                    />
                </div>
                <FilterButtons />
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Filtres Marketing</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-6 h-6 text-gray-900" />
                            </button>
                        </div>
                        <div className="flex-1 p-6">
                            <FilterButtons isMobile />
                        </div>
                    </div>
                </div>
            )}

            {/* Grille d'images */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-16 lg:pt-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="bg-white py-20 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-4 pt-16 lg:pt-0">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Aucune image trouvée</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                        Générez des créatives depuis la page des livres ou des packs pour les voir apparaître ici.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pt-16 lg:pt-0">
                    {filteredAssets.map((asset) => (
                        <div 
                            key={asset.name}
                            className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image Preview */}
                            <div className="aspect-[4/5] relative bg-slate-900 overflow-hidden">
                                <Image 
                                    src={(() => {
                                        const url = asset.url || asset.name;
                                        if (!url) return '';
                                        if (url.startsWith('http')) return url;
                                        if (url.startsWith('data:image')) return url;
                                        if (url.startsWith('/uploads')) return url;
                                        if (url.startsWith('uploads')) return `/${url}`;
                                        return `/uploads/books/${url}`;
                                    })()}
                                    alt={asset.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <a 
                                        href={(() => {
                                            const url = asset.url || asset.name;
                                            if (!url) return '';
                                            if (url.startsWith('http')) return url;
                                            if (url.startsWith('data:image')) return url;
                                            if (url.startsWith('/uploads')) return url;
                                            if (url.startsWith('uploads')) return `/${url}`;
                                            return `/uploads/books/${url}`;
                                        })()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                        title="Voir en plein écran"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(asset.name)}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                        {asset.name.startsWith('pack') ? 'Pack' : asset.name.startsWith('desc') ? 'Description' : 'Créative'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] text-slate-400 font-black uppercase">
                                            {new Date(asset.createdAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="text-[11px] font-bold text-slate-900 truncate mb-4" title={asset.name}>
                                    {asset.name.split('-').slice(1).join('-') || asset.name}
                                </p>

                                {/* Partage via n8n */}
                                <div className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-2">
                                    <button 
                                        onClick={() => handlePublish(asset, 'facebook')}
                                        title="Publier sur Facebook"
                                        className="flex items-center justify-center p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                    >
                                        <Facebook className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handlePublish(asset, 'instagram')}
                                        title="Publier sur Instagram"
                                        className="flex items-center justify-center p-2 bg-slate-50 hover:bg-pink-50 text-slate-400 hover:text-pink-600 rounded-xl transition-all"
                                    >
                                        <Instagram className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handlePublish(asset, 'tiktok')}
                                        title="Publier sur TikTok"
                                        className="flex items-center justify-center p-2 bg-slate-50 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all"
                                    >
                                        <Music className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handlePublish(asset, 'all')}
                                        title="Publier sur Tout"
                                        className="flex items-center justify-center p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm active:scale-90"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

