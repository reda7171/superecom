'use client'

import { useState, useEffect } from 'react'
import { FileText, X, Printer, LayoutList, Type, Loader2, ImageIcon, Book as BookIcon, Filter, Palette, Grid3X3 } from 'lucide-react'
import { getAllBooksForCatalog } from '@/lib/actions/books'
import { normalizeImage } from '@/lib/utils'

interface CatalogModalProps {
    isOpen: boolean
    onClose: () => void
    triggerEvent?: string // New prop for external triggers
}

export default function CatalogModal({ isOpen: initialIsOpen, onClose, triggerEvent }: CatalogModalProps) {
    const [isOpen, setIsOpen] = useState(initialIsOpen)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isVisitor, setIsVisitor] = useState(false)
    const [allBooks, setAllBooks] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [config, setConfig] = useState({
        booksPerPage: 12,
        title: 'Catalogue Riwaya',
        subtitle: 'Découvrez notre collection',
        primaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        pattern: 'none',
        showPrice: true,
        selectedCategory: 'all'
    })

    useEffect(() => {
        if (!triggerEvent) return
        
        const handleTrigger = () => {
            setIsVisitor(true)
            setConfig(prev => ({ ...prev, booksPerPage: 12 }))
            setIsOpen(true)
        }
        window.addEventListener(triggerEvent, handleTrigger)
        return () => window.removeEventListener(triggerEvent, handleTrigger)
    }, [triggerEvent])

    // Auto-download for visitors
    useEffect(() => {
        if (isVisitor && isOpen && allBooks.length > 0) {
            setTimeout(() => {
                window.print()
                setTimeout(() => setIsOpen(false), 1000)
            }, 1500)
        }
    }, [isVisitor, isOpen, allBooks])

    useEffect(() => {
        setIsOpen(initialIsOpen)
    }, [initialIsOpen])

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const result = await getAllBooksForCatalog()
                if (result.success && result.data) {
                    setAllBooks(result.data)
                    const uniqueCats = Array.from(new Set(result.data.map((b: any) => b.category).filter(Boolean))) as string[]
                    setCategories(uniqueCats.sort())
                }
            }
            loadData()
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleClose = () => {
        setIsOpen(false)
        onClose()
    }

    const filteredBooks = config.selectedCategory === 'all' 
        ? allBooks 
        : allBooks.filter(b => b.category === config.selectedCategory)

    const chunkBooks = (arr: any[], size: number) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        )
    }

    const handleGenerate = () => {
        if (filteredBooks.length === 0) {
            alert('Aucun livre trouvé.')
            return
        }
        setIsGenerating(true)
        setTimeout(() => {
            window.print()
            setIsGenerating(false)
        }, 500)
    }

    const bookPages = chunkBooks(filteredBooks, config.booksPerPage)
    const numRows = Math.ceil(config.booksPerPage / 2)
    const rowHeight = (25 / numRows).toFixed(2)

    // Définition des styles de motifs
    const getPatternStyle = () => {
        switch (config.pattern) {
            case 'stripes':
                return { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.015) 10px, rgba(0,0,0,0.015) 20px)' };
            case 'dots':
                return { backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '15px 15px' };
            case 'grid':
                return { backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)', backgroundSize: '25px 25px' };
            default:
                return {};
        }
    }

    return (
        <>
            <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 print:hidden ${isVisitor ? 'opacity-0 pointer-events-none' : ''}`}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/20">
                    <div className="bg-purple-600 p-6 flex items-center justify-between text-white border-b border-purple-700 shadow-xl">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Catalogue Riwaya</h2>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition-colors font-bold"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-600" /> Texte
                            </h3>
                            <input 
                                type="text"
                                value={config.title}
                                onChange={(e) => setConfig({...config, title: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="Titre"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-blue-600" /> Apparence
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Couleur de fond</label>
                                    <div className="flex gap-2">
                                        {['#ffffff', '#fdfbf7', '#f3f4f6', '#f0f9ff', '#f0fdf4'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setConfig({...config, backgroundColor: color})}
                                                className={`w-6 h-6 rounded-full border-2 ${config.backgroundColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Motif de fond</label>
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'none', label: 'Aucun' },
                                            { id: 'stripes', label: 'Rayures' },
                                            { id: 'dots', label: 'Points' },
                                            { id: 'grid', label: 'Grille' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setConfig({...config, pattern: p.id})}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all border ${config.pattern === p.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-400'}`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-blue-600" /> Catégorie
                                </h3>
                                <select 
                                    value={config.selectedCategory}
                                    onChange={(e) => setConfig({...config, selectedCategory: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg text-sm"
                                >
                                    <option value="all">Toutes</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4 text-blue-600" /> Page
                                </h3>
                                <select 
                                    value={config.booksPerPage}
                                    onChange={(e) => setConfig({...config, booksPerPage: Number(e.target.value)})}
                                    className="w-full px-4 py-2 border rounded-lg text-sm"
                                >
                                    <option value="6">6/page</option>
                                    <option value="12">12/page</option>
                                    <option value="18">18/page</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t">
                        <button onClick={onClose} className="px-6 py-2.5 text-gray-700">Annuler</button>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || allBooks.length === 0}
                            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg"
                        >
                            {isGenerating ? 'Préparation...' : 'Générer'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Area */}
            <div className="hidden print:block absolute top-0 left-0 w-full" style={{ backgroundColor: config.backgroundColor, ...getPatternStyle() }}>
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        @page { margin: 0; size: A4; }
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; box-sizing: border-box; }
                        aside, header, nav, .print-hidden, button, input, .search-bar, .lucide { display: none !important; }
                        .catalog-print-area .lucide { display: block !important; }
                        .pl-64 { padding-left: 0 !important; }
                        main { padding: 0 !important; }
                        .page-break { page-break-after: always; display: block; position: relative; }
                    }
                `}} />

                {/* Cover Page */}
                <div className="relative w-full h-[29.7cm] flex flex-col page-break overflow-hidden" style={{ ...getPatternStyle() }}>
                    <div className="h-[40%] w-full flex items-center justify-center shadow-lg" style={{ backgroundColor: config.primaryColor }}>
                        <div className="catalog-print-area"><BookIcon className="w-32 h-32 text-white/30 lucide" /></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase">{config.title}</h1>
                        <p className="text-2xl text-gray-400 italic mb-10">
                            {config.selectedCategory !== 'all' ? `Collection : ${config.selectedCategory}` : config.subtitle}
                        </p>
                        <div className="w-20 h-1 bg-blue-600 mb-10"></div>
                        <p className="text-sm font-bold text-gray-300 tracking-[0.5em] uppercase tracking-widest">Riwaya Catalogue</p>
                    </div>
                </div>

                {/* Book Pages */}
                {bookPages.map((pageBooks, pageIdx) => (
                    <div key={pageIdx} className="w-full h-[29.7cm] p-10 page-break overflow-hidden flex flex-col pt-12" style={{ ...getPatternStyle() }}>
                        <div className="grid grid-cols-2 gap-6 flex-1">
                            {pageBooks.map((book, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex gap-4 border border-gray-100 rounded-2xl p-4 break-inside-avoid shadow-sm"
                                    style={{ height: `${rowHeight}cm`, backgroundColor: 'white' }}
                                >
                                    <div className="w-[35%] h-full flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-2">
                                        {book.image ? (
                                            <img src={normalizeImage(book.image)} alt={book.title} className="h-full w-full object-contain" />
                                        ) : (
                                            <div className="catalog-print-area"><ImageIcon className="w-8 h-8 text-gray-200 lucide" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col py-1 overflow-hidden h-full">
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="text-sm font-black text-gray-900 uppercase line-clamp-2 mb-1">{book.title}</h3>
                                            <p className="text-[10px] text-blue-600 font-bold truncate mb-2">{book.author}</p>
                                            <p className="text-[9px] text-gray-400 line-clamp-3 leading-relaxed italic">{book.description || "Sélectionné par nos soins."}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                                            {config.showPrice && <span className="text-base font-black text-gray-900">{book.price} MAD</span>}
                                            {book.category && <span className="text-[8px] font-bold text-gray-400 uppercase border border-gray-200 px-2 py-0.5 rounded truncate">{book.category}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
