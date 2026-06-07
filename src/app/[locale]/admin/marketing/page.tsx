'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, 
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
    X,
    Plus,
    Upload,
    Loader2
} from 'lucide-react'
import Image from 'next/image'

interface Asset {
    name: string
    url: string
    type: string
    productId?: string
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
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadType, setUploadType] = useState<'CREATIVE' | 'PACK' | 'DESCRIPTION'>('CREATIVE')
    const [uploadName, setUploadName] = useState('')
    // Sélection multiple
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [selectionMode, setSelectionMode] = useState(false)
    const [bulkPublishing, setBulkPublishing] = useState(false)
    const [bulkPlatform, setBulkPlatform] = useState<'facebook' | 'instagram' | 'all'>('all')
    // Modal diapo preview
    const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false)
    const [slideIndex, setSlideIndex] = useState(0)
    const [captions, setCaptions] = useState<Record<string, string>>({})
    const [publishProgress, setPublishProgress] = useState<Record<string, 'idle' | 'loading' | 'ok' | 'error'>>({}) 

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
                    customImageUrl: asset.url,
                    platform: platform === 'all' ? 'both' : platform,
                    format: 'post'
                })
            })
            const data = await res.json()
            if (!data.success) alert(`Erreur: ${data.error || 'Publication échouée'}`)
        } catch {
            alert('Erreur technique lors de la publication')
        }
    }

    // Basculer sélection d'un asset
    const toggleSelect = (name: string) => {
        setSelectedAssets(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        )
    }

    // Ouvrir le modal diapo avant publication
    const openBulkPreview = () => {
        if (selectedAssets.length === 0) return
        setSlideIndex(0)
        setPublishProgress({})
        setBulkPreviewOpen(true)
    }

    // Publication groupée depuis le modal
    const handleBulkPublish = async () => {
        const selected = assets.filter(a => selectedAssets.includes(a.name))
        setBulkPublishing(true)
        const progress: Record<string, 'idle' | 'loading' | 'ok' | 'error'> = {}
        selected.forEach(a => { progress[a.name] = 'loading' })
        setPublishProgress({ ...progress })

        for (const asset of selected) {
            try {
                const res = await fetch('/api/n8n/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customImageUrl: asset.url,
                        customCaption: captions[asset.name] || '',
                        platform: bulkPlatform === 'all' ? 'both' : bulkPlatform,
                        format: 'post'
                    })
                })
                const data = await res.json()
                progress[asset.name] = data.success ? 'ok' : 'error'
            } catch {
                progress[asset.name] = 'error'
            }
            setPublishProgress({ ...progress })
            if (selected.indexOf(asset) < selected.length - 1) {
                await new Promise(r => setTimeout(r, 1500))
            }
        }
        setBulkPublishing(false)
        const ok = Object.values(progress).filter(s => s === 'ok').length
        const total = selected.length
        if (ok === total) {
            setTimeout(() => {
                setBulkPreviewOpen(false)
                setSelectedAssets([])
                setSelectionMode(false)
            }, 1500)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'marketing')
        formData.append('marketingType', uploadType)
        formData.append('customName', uploadName || file.name)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.success) {
                await fetchAssets()
                setIsUploadModalOpen(false)
                setUploadName('')
            } else {
                alert(data.error || 'Erreur lors de l\'upload')
            }
        } catch (error) {
            alert('Erreur technique lors de l\'upload')
        } finally {
            setUploading(false)
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

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Mode sélection */}
                    <button
                        onClick={() => { setSelectionMode(s => !s); setSelectedAssets([]) }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all active:scale-95 ${
                            selectionMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        {selectionMode ? `Sélection (${selectedAssets.length})` : 'Sélectionner'}
                    </button>

                    {/* Publier la sélection */}
                    {selectionMode && selectedAssets.length > 0 && (
                        <div className="flex items-center gap-2">
                            <select
                                value={bulkPlatform}
                                onChange={e => setBulkPlatform(e.target.value as any)}
                                className="px-3 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none"
                            >
                                <option value="all">Toutes plateformes</option>
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                            </select>
                            <button
                                onClick={openBulkPreview}
                                className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all active:scale-95"
                            >
                                <Eye className="w-4 h-4" />
                                Prévisualiser {selectedAssets.length} créative{selectedAssets.length > 1 ? 's' : ''}
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Créative
                    </button>
                    <button 
                        onClick={fetchAssets}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>
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
                    {filteredAssets.map((asset) => {
                        const isSelected = selectedAssets.includes(asset.name)
                        return (
                        <div 
                            key={asset.name}
                            className={`group relative bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                                isSelected ? 'border-indigo-500 ring-2 ring-indigo-400' : 'border-slate-100'
                            }`}
                            onClick={selectionMode ? () => toggleSelect(asset.name) : undefined}
                        >
                            {/* Checkbox sélection */}
                            {selectionMode && (
                                <div className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white/80 border-slate-300'
                                }`}>
                                    {isSelected && <span className="text-white text-xs font-black">✓</span>}
                                </div>
                            )}
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
                                        return `/uploads/products/${url}`;
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
                                            return `/uploads/products/${url}`;
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
                        )
                    })}
                </div>
            )}
            {/* Modal d'Upload */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900">Ajouter une Créative</h2>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nom de la créative (Facultatif)</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Pub Facebook Promo Ramadan"
                                        value={uploadName}
                                        onChange={(e) => setUploadName(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Type d'Asset</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'CREATIVE', label: 'Pub', icon: Sparkles },
                                            { id: 'PACK', label: 'Pack', icon: Filter },
                                            { id: 'DESCRIPTION', label: 'Desc', icon: Quote }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setUploadType(type.id as any)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                                    uploadType === type.id 
                                                        ? 'bg-indigo-50 border-indigo-600 text-indigo-600' 
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                            >
                                                <type.icon className="w-5 h-5 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <label className="relative group cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                        <div className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
                                            {uploading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Upload className="w-5 h-5" />
                                            )}
                                            {uploading ? 'Envoi en cours...' : 'Sélectionner l\'image'}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal diapo preview + publication groupée */}
            {bulkPreviewOpen && (() => {
                const selected = assets.filter(a => selectedAssets.includes(a.name))
                const current = selected[slideIndex]
                const status = current ? publishProgress[current.name] : null
                return (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl mx-4 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                        {slideIndex + 1} / {selected.length}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{current?.name}</span>
                                </div>
                                <button onClick={() => setBulkPreviewOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Diapo image + statut */}
                            <div className="relative flex-1 bg-slate-900 flex items-center justify-center min-h-[300px]">
                                {current && (
                                    <Image
                                        src={current.url.startsWith('http') ? current.url : current.url.startsWith('/') ? current.url : `/${current.url}`}
                                        alt={current.name}
                                        fill
                                        className="object-contain"
                                    />
                                )}
                                {/* Statut overlay */}
                                {status === 'loading' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                                    </div>
                                )}
                                {status === 'ok' && (
                                    <div className="absolute inset-0 bg-green-600/70 flex items-center justify-center">
                                        <span className="text-white text-4xl font-black">✓</span>
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center">
                                        <span className="text-white text-4xl font-black">✕</span>
                                    </div>
                                )}
                                {/* Navigation */}
                                <button
                                    onClick={() => setSlideIndex(i => Math.max(0, i - 1))}
                                    disabled={slideIndex === 0}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 hover:bg-white transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setSlideIndex(i => Math.min(selected.length - 1, i + 1))}
                                    disabled={slideIndex === selected.length - 1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 hover:bg-white transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Miniatures */}
                            <div className="flex gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100 overflow-x-auto">
                                {selected.map((a, i) => {
                                    const s = publishProgress[a.name]
                                    return (
                                        <button
                                            key={a.name}
                                            onClick={() => setSlideIndex(i)}
                                            className={`relative w-12 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                                                i === slideIndex ? 'border-indigo-500' : 'border-transparent'
                                            }`}
                                        >
                                            <Image src={a.url.startsWith('http') ? a.url : a.url.startsWith('/') ? a.url : `/${a.url}`} alt={a.name} fill className="object-cover" />
                                            {s === 'ok' && <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center"><span className="text-white text-xs font-black">✓</span></div>}
                                            {s === 'error' && <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center"><span className="text-white text-xs font-black">✕</span></div>}
                                            {s === 'loading' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-3 h-3 text-white animate-spin" /></div>}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Caption */}
                            <div className="px-6 py-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Caption pour cette image</label>
                                <textarea
                                    rows={3}
                                    placeholder="Texte de la publication (optionnel)..."
                                    value={current ? (captions[current.name] || '') : ''}
                                    onChange={e => current && setCaptions(prev => ({ ...prev, [current.name]: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-400 resize-none"
                                />
                            </div>

                            {/* Footer actions */}
                            <div className="px-6 pb-6 flex items-center gap-3">
                                <select
                                    value={bulkPlatform}
                                    onChange={e => setBulkPlatform(e.target.value as any)}
                                    className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white outline-none"
                                >
                                    <option value="all">Toutes plateformes</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                </select>
                                <button
                                    onClick={handleBulkPublish}
                                    disabled={bulkPublishing}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {bulkPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Publier {selected.length} créative{selected.length > 1 ? 's' : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}

