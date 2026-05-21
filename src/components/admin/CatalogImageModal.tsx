'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Download, ImageIcon, Loader2, Type, Palette, LayoutGrid, Book as BookIcon, CheckCircle2, Globe } from 'lucide-react'
import { getAllBooksForCatalog } from '@/lib/actions/books'
import { normalizeImage } from '@/lib/utils'
import * as htmlToImage from 'html-to-image'

interface CatalogImageModalProps {
    isOpen: boolean
    onClose: () => void
}

const BG_COLORS = [
    { name: 'Pure', color: '#ffffff', text: '#111827' },
    { name: 'Cream', color: '#fdfbf7', text: '#111827' },
    { name: 'Dark', color: '#0f172a', text: '#ffffff' },
    { name: 'Soft Rose', color: '#fff1f2', text: '#111827' },
    { name: 'Minimal', color: '#f8fafc', text: '#111827' },
]

export default function CatalogImageModal({ isOpen, onClose }: CatalogImageModalProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [allBooks, setAllBooks] = useState<any[]>([])
    const [currentChunkIdx, setCurrentChunkIdx] = useState(0)
    const [statusText, setStatusText] = useState('')
    const [config, setConfig] = useState({
        title: 'Collection Riwaya',
        primaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        pattern: 'none',
        columns: 3,
        selectedCategory: 'all',
        groupByLanguage: true
    })
    const captureRef = useRef<HTMLDivElement>(null)

    const BOOKS_PER_PAGE = 24

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const result = await getAllBooksForCatalog()
                if (result.success && result.data) setAllBooks(result.data)
            }
            loadData()
        }
    }, [isOpen])

    if (!isOpen) return null

    const filteredBooks = config.selectedCategory === 'all' 
        ? allBooks 
        : allBooks.filter(b => b.category === config.selectedCategory)

    const languageNames: { [key: string]: string } = {
        fr: 'Langue : Français',
        ar: 'اللغة : العربية',
        en: 'Language : English'
    }

    const getChunkedBooks = () => {
        const chunkedBooksBase = Array.from({ length: Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) }, (_, i) =>
            filteredBooks.slice(i * BOOKS_PER_PAGE, i * BOOKS_PER_PAGE + BOOKS_PER_PAGE)
        )

        if (!config.groupByLanguage) {
            return chunkedBooksBase.map(chunk => ({
                language: 'all',
                books: chunk
            }))
        }

        const booksByLanguage: { [key: string]: any[] } = {}
        filteredBooks.forEach(book => {
            const lang = book.language || 'fr'
            if (!booksByLanguage[lang]) {
                booksByLanguage[lang] = []
            }
            booksByLanguage[lang].push(book)
        })

        const chunks: { language: string; books: any[] }[] = []
        const sortedLanguages = Object.keys(booksByLanguage).sort()
        sortedLanguages.forEach(lang => {
            const list = booksByLanguage[lang]
            const count = Math.ceil(list.length / BOOKS_PER_PAGE)
            for (let i = 0; i < count; i++) {
                chunks.push({
                    language: lang,
                    books: list.slice(i * BOOKS_PER_PAGE, i * BOOKS_PER_PAGE + BOOKS_PER_PAGE)
                })
            }
        })

        return chunks
    }

    const chunkedBooks = getChunkedBooks()

    const categories = Array.from(new Set(allBooks.map(b => b.category).filter(Boolean))).sort()

    const handleExportAll = async () => {
        if (!captureRef.current || chunkedBooks.length === 0) return
        setIsGenerating(true)
        
        let successCount = 0

        try {
            for (let i = 0; i < chunkedBooks.length; i++) {
                setCurrentChunkIdx(i)
                setStatusText(`Exportation image ${i + 1}/${chunkedBooks.length}...`)
                await new Promise(resolve => setTimeout(resolve, 500))

                const dataUrl = await htmlToImage.toPng(captureRef.current, {
                    quality: 1,
                    pixelRatio: 2,
                    backgroundColor: config.backgroundColor,
                    style: { fontFamily: "'Cairo', sans-serif" }
                })
                
                const link = document.createElement('a')
                link.href = dataUrl
                link.download = `riwaya-catalog-p${i + 1}.png`
                link.click()
                successCount++
                
                await new Promise(resolve => setTimeout(resolve, 800))
            }
            
            if (successCount > 0) {
                setStatusText('✓ Terminé !')
                setTimeout(() => { setStatusText(''); onClose(); }, 2000)
            }
        } catch (error) {
            console.error(error)
            alert('Erreur lors de la capture.')
        } finally {
            setIsGenerating(false)
            setCurrentChunkIdx(0)
        }
    }

    const getPatternStyle = (pattern: string, color: string) => {
        const op = color === '#0f172a' ? 0.08 : 0.05
        const pColor = config.primaryColor
        
        if (pattern === 'dots') {
            return { 
                backgroundImage: `radial-gradient(${pColor} 15%, transparent 16%)`, 
                backgroundSize: '40px 40px' 
            }
        }
        if (pattern === 'stripes') {
            return { 
                backgroundImage: `repeating-linear-gradient(45deg, ${pColor} 0, ${pColor} 5px, transparent 5px, transparent 25px)`,
                opacity: op * 2
            }
        }
        if (pattern === 'grid') {
            return { 
                backgroundImage: `linear-gradient(${pColor} 1.5px, transparent 1.5px), linear-gradient(90deg, ${pColor} 1.5px, transparent 1.5px)`, 
                backgroundSize: '60px 60px',
                opacity: op * 1.5
            }
        }
        return {}
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black backdrop-blur-md">
            <div className="bg-white w-full h-full flex flex-col overflow-hidden shadow-2xl">
                <div className="bg-purple-600 p-6 flex items-center justify-between text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="w-6 h-6" />
                        <h2 className="text-xl font-bold uppercase tracking-tight">Générateur IMAGE</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors font-bold text-xl"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <div className="w-full md:w-80 p-8 border-r border-gray-100 flex flex-col bg-white overflow-y-auto shrink-0">
                        <div className="space-y-8 flex-1 text-gray-900 font-bold">
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest block mb-3">Fond</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {BG_COLORS.map(bg => (
                                        <button 
                                            key={bg.color}
                                            onClick={() => setConfig({...config, backgroundColor: bg.color, textColor: bg.text})}
                                            className={`w-full aspect-square rounded-xl border-2 transition-all ${config.backgroundColor === bg.color ? 'border-purple-600 scale-110 shadow-lg' : 'border-gray-100 hover:scale-110'}`}
                                            style={{ backgroundColor: bg.color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest block mb-3">Motif</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['none', 'dots', 'stripes', 'grid'].map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setConfig({...config, pattern: p})}
                                            className={`py-3 rounded-2xl text-[9px] font-black border-2 transition-all uppercase ${config.pattern === p ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                                        >
                                            {p === 'none' ? 'Pur' : p === 'dots' ? 'Points' : p === 'stripes' ? 'Lignes' : 'Grille'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 text-gray-900">
                                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Thème</label>
                                <div className="flex gap-2.5">
                                    {['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#111827'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setConfig({...config, primaryColor: c})}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${config.primaryColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest block mb-3">Langue</label>
                                <label className="flex items-center gap-2 cursor-pointer py-1">
                                    <input 
                                        type="checkbox"
                                        checked={config.groupByLanguage}
                                        onChange={(e) => setConfig({...config, groupByLanguage: e.target.checked})}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">Regrouper par langue</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-8 space-y-4">
                            {statusText && (
                                <div className="p-4 bg-purple-50 rounded-2xl flex items-center gap-3 text-purple-600 font-bold text-xs">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {statusText}
                                </div>
                            )}
                            <button
                                onClick={handleExportAll}
                                disabled={isGenerating || allBooks.length === 0}
                                className="w-full py-5 bg-purple-600 text-white font-black rounded-3xl shadow-xl hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : 'TÉLÉCHARGER'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-200 p-8 overflow-auto flex justify-center items-start">
                        <div className="scale-[0.22] origin-top shadow-3xl overflow-hidden bg-white" style={{ backgroundColor: config.backgroundColor }}>
                             <div className="w-[1200px] p-24 flex flex-col items-center relative min-h-[1400px]">
                                <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.1, ...getPatternStyle(config.pattern, config.backgroundColor) }}></div>
                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <h1 dir="auto" className="text-[140px] font-black uppercase text-center mb-6" style={{ color: config.primaryColor }}>{config.title}</h1>
                                    {config.groupByLanguage && chunkedBooks[currentChunkIdx]?.language !== 'all' && (
                                        <p className="text-4xl font-black mb-10 uppercase tracking-wider text-center" style={{ color: config.primaryColor }}>
                                            {languageNames[chunkedBooks[currentChunkIdx]?.language]}
                                        </p>
                                    )}
                                    <div className="w-full grid gap-12" style={{ gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))` }}>
                                        {(chunkedBooks[currentChunkIdx]?.books || []).map((book: any, idx: number) => (
                                            <div key={idx} className="flex flex-col items-center">
                                                <div className="w-full aspect-[2/3] bg-white rounded-[60px] mb-8 overflow-hidden border-8 border-white shadow-2xl">
                                                    {book.image ? <img src={normalizeImage(book.image)} className="w-full h-full object-cover" /> : <BookIcon className="w-20 h-20 text-gray-200" />}
                                                </div>
                                                <p dir="auto" className="font-black text-3xl text-center mb-4" style={{ color: config.textColor }}>{book.title}</p>
                                                <div className="px-10 py-3 rounded-full font-black text-2xl text-white" style={{ backgroundColor: config.primaryColor }}>{book.price} MAD</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* REAL CAPTURE AREA */}
            <div 
                ref={captureRef}
                style={{ 
                    position: 'absolute', 
                    top: '-40000px', 
                    left: '-40000px', 
                    width: '1200px', 
                    backgroundColor: config.backgroundColor,
                    padding: '120px 80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '1200px',
                    overflow: 'hidden'
                }}
            >
                {/* Pattern Layer - Using simpler logic for html2canvas */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, ...getPatternStyle(config.pattern, config.backgroundColor) }}></div>

                {/* Content Layer */}
                <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* Header */}
                    <div style={{ width: '100%', textAlign: 'center', marginBottom: '140px' }}>
                        {chunkedBooks.length > 1 && (
                            <div style={{ marginBottom: '60px' }}>
                                <span style={{ fontSize: '36px', fontWeight: '950', color: config.textColor, opacity: 0.3, letterSpacing: '12px', textTransform: 'uppercase' }}>
                                    PARTIE {currentChunkIdx + 1} / {chunkedBooks.length}
                                </span>
                            </div>
                        )}
                        <h1 dir="auto" style={{ fontSize: '180px', fontWeight: '950', color: config.primaryColor, textTransform: 'uppercase', letterSpacing: '-6px', margin: '0 0 30px 0', lineHeight: '0.9', textAlign: 'center' }}>
                            {config.title}
                        </h1>
                        {config.groupByLanguage && chunkedBooks[currentChunkIdx]?.language !== 'all' && (
                            <div style={{ marginBottom: '50px' }}>
                                <span style={{ fontSize: '48px', fontWeight: '950', color: config.textColor, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>
                                    {languageNames[chunkedBooks[currentChunkIdx]?.language]}
                                </span>
                            </div>
                        )}
                        <div style={{ height: '30px', width: '400px', backgroundColor: config.primaryColor, margin: '0 auto', borderRadius: '15px' }}></div>
                    </div>

                    {/* Grid */}
                    <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '140px 60px', justifyContent: 'center' }}>
                        {(chunkedBooks[currentChunkIdx]?.books || []).map((book: any, idx: number) => {
                            const cellWidth = Math.floor((1040 - (config.columns - 1) * 60) / config.columns)
                            return (
                                <div key={idx} style={{ width: `${cellWidth}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '100%', 
                                        height: `${Math.floor(cellWidth * 1.5)}px`, 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '55px', 
                                        overflow: 'hidden', 
                                        border: '18px solid #ffffff', 
                                        boxShadow: config.backgroundColor === '#0f172a' ? '0 0 80px rgba(255,255,255,0.1)' : '0 45px 90px rgba(0,0,0,0.18)',
                                        marginBottom: '45px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {book.image ? (
                                            <img src={normalizeImage(book.image)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px' }} crossOrigin="anonymous" />
                                        ) : (
                                            <BookIcon style={{ width: '140px', height: '140px', color: '#f3f4f6' }} />
                                        )}
                                    </div>
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '220px' }}>
                                        <h3 dir="auto" style={{ 
                                            fontSize: '48px', 
                                            fontWeight: '850', 
                                            color: config.textColor, 
                                            margin: '0', 
                                            textAlign: 'center',
                                            width: '100%',
                                            lineHeight: '1.3',
                                            direction: 'rtl',
                                            paddingBottom: '30px'
                                        }}>
                                            {book.title}
                                        </h3>
                                        <div style={{ 
                                            backgroundColor: config.primaryColor, 
                                            color: '#ffffff', 
                                            padding: '22px 65px', 
                                            borderRadius: '100px', 
                                            fontSize: '42px', 
                                            fontWeight: '950', 
                                            marginTop: 'auto',
                                            boxShadow: '0 25px 50px rgba(0,0,0,0.2)' 
                                        }}>
                                            {book.price} MAD
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ width: '100%', marginTop: '200px', paddingTop: '100px', borderTop: `10px solid ${config.textColor}1a`, textAlign: 'center' }}>
                        <p style={{ fontSize: '110px', fontWeight: '950', color: config.textColor, opacity: 0.1, letterSpacing: '25px', textTransform: 'uppercase', margin: 0 }}>RIWAYA.COM</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
