'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, Loader2, BookOpen, X, ArrowRight, Clock } from 'lucide-react'
import { searchBooksPredictive } from '@/lib/actions/search'
import { getPopularCategories } from '@/lib/actions/categories'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Hash } from 'lucide-react'
import { trackBadgeClick } from '@/lib/actions/analytics'

const Countdown = ({ expiresAt }: { expiresAt: string | Date }) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiresAt).getTime() - new Date().getTime()
            if (difference <= 0) return 'Terminé'

            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference / 1000 / 60) % 60)
            const seconds = Math.floor((difference / 1000) % 60)

            return `${hours}h ${minutes}m ${seconds}s`
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
        return () => clearInterval(timer)
    }, [expiresAt])

    return (
        <div className="flex items-center gap-1.5 mt-0.5 text-[8px] font-black text-orange-600 animate-pulse uppercase tracking-tight">
            <Clock className="w-2.5 h-2.5" />
            <span>Fin dans: {timeLeft}</span>
        </div>
    )
}

export default function PredictiveSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [history, setHistory] = useState<string[]>([])
    const [popularCats, setPopularCats] = useState<{
        name: string;
        count: number;
        badge: string | null;
        badgeColor: string | null;
        badgeExpiresAt: Date | string | null;
        topAuthor: string | null;
        minPrice: number;
        avgDiscount?: number;
        isFreeDelivery?: boolean;
    }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Charger l'historique et les catégories au montage
    useEffect(() => {
        const savedHistory = localStorage.getItem('riwaya_search_history')
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory))
        }

        // Charger les thèmes populaires avec leurs comptes
        getPopularCategories().then((data: any) => setPopularCats(data))

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const saveToHistory = (searchTerm: string) => {
        if (!searchTerm.trim() || searchTerm.length < 2) return

        const newHistory = [
            searchTerm.trim(),
            ...history.filter(h => h.toLowerCase() !== searchTerm.trim().toLowerCase())
        ].slice(0, 5) // Garder les 5 dernières recherches

        setHistory(newHistory)
        localStorage.setItem('riwaya_search_history', JSON.stringify(newHistory))
    }

    const clearHistory = (e: React.MouseEvent) => {
        e.stopPropagation()
        setHistory([])
        localStorage.removeItem('riwaya_search_history')
    }

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true)
                const data = await searchBooksPredictive(query)
                setResults(data)
                setIsLoading(false)
                setIsOpen(true)
            } else {
                setResults([])
                // Si l'input est vide on affiche l'historique ou les thèmes
                if (query.length === 0 && (history.length > 0 || popularCats.length > 0)) {
                    // L'état isOpen est géré par onFocus
                } else {
                    setIsOpen(false)
                }
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, history.length, popularCats.length])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            saveToHistory(query)
            router.push(`/books?search=${encodeURIComponent(query.trim())}`)
            setIsOpen(false)
        }
    }

    const handleHistoryClick = (searchTerm: string) => {
        setQuery(searchTerm)
        saveToHistory(searchTerm)
        router.push(`/books?search=${encodeURIComponent(searchTerm)}`)
        setIsOpen(false)
    }

    const handleCategoryClick = (category: string, badge?: string | null) => {
        if (badge) {
            trackBadgeClick(badge, category)
        }
        router.push(`/books?category=${encodeURIComponent(category)}`)
        setIsOpen(false)
    }

    return (
        <div ref={searchRef} className="relative w-full max-w-xl group">
            {/* Form standard inspiré par Pixio */}
            <form onSubmit={handleSearch} className="relative group/input">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => (query.length >= 2 || history.length > 0 || popularCats.length > 0) && setIsOpen(true)}
                    placeholder="Rechercher un livre, un auteur..."
                    className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-[2rem] py-4 pl-14 pr-10 font-bold text-gray-900 transition-all outline-none placeholder:text-gray-400 shadow-sm focus:shadow-xl group-hover/input:border-gray-200"
                />
                <SearchIcon className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isOpen ? 'text-black' : 'text-gray-300'}`} />

                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </form>

            {/* Dropdown Results - Style Pixio */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">

                    {/* Suggestions si query vide */}
                    {query.length === 0 && (
                        <div className="p-4 space-y-6">
                            {/* Historique */}
                            {history.length > 0 && (
                                <div className="px-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Recherches récentes</span>
                                        <button
                                            onClick={clearHistory}
                                            className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Effacer
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {history.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleHistoryClick(item)}
                                                className="px-4 py-2 bg-gray-50 hover:bg-black hover:text-white rounded-full text-sm font-bold text-gray-600 transition-all"
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Thèmes populaires - Style Cartes Pixio */}
                            {popularCats.length > 0 && (
                                <div>
                                    <div className="px-2 mb-4">
                                        <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Thèmes populaires</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {popularCats.map((cat, idx) => {
                                            const badge = cat.badge
                                            const customColor = cat.badgeColor
                                            const badgeColorClass = customColor?.startsWith('bg-') ? customColor : badge === 'NEW' ? 'bg-green-500' : badge === 'HOT' ? 'bg-red-500' : badge === 'TRENDING' ? 'bg-blue-600' : 'bg-orange-500'
                                            const badgeStyle = !customColor?.startsWith('bg-') ? { backgroundColor: customColor || undefined } : {}
                                            const badgeLabel = badge === 'PROMO' ? 'Promo' : badge === 'NEW' ? 'Nouveau' : badge === 'HOT' ? 'Top' : badge === 'TRENDING' ? 'Tendance' : badge

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleCategoryClick(cat.name, badge || (cat.avgDiscount ? 'PROMO' : cat.isFreeDelivery ? 'LIVRAISON' : null))}
                                                    className="relative flex flex-col gap-3 p-5 bg-pixio-cream border border-transparent hover:border-black rounded-[2rem] transition-all text-center group/cat overflow-hidden items-center"
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black group-hover/cat:bg-black group-hover/cat:text-white shadow-sm transition-all">
                                                        <Hash className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-black text-gray-900 group-hover/cat:text-black">{cat.name}</span>
                                                        <div className="flex flex-col items-center gap-1 mt-1">
                                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${cat.count < 3 && cat.count > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`}>
                                                                {cat.count < 3 && cat.count > 0 && '🔥 '}
                                                                {cat.count} livre{cat.count > 1 ? 's' : ''}
                                                                {cat.count < 3 && cat.count > 0 && ' restant!'}
                                                            </span>
                                                            {cat.topAuthor && (
                                                                <span className="text-[10px] font-medium text-gray-500 italic">
                                                                    Par {cat.topAuthor}
                                                                </span>
                                                            )}
                                                            {cat.minPrice > 0 && (
                                                                <span className="text-[10px] font-black text-black bg-white px-3 py-1 rounded-full shadow-sm mt-1">
                                                                    Dès {cat.minPrice} MAD
                                                                </span>
                                                            )}
                                                        </div>
                                                        {badge === 'PROMO' && cat.badgeExpiresAt && (
                                                            <div className="mt-2 scale-110">
                                                                <Countdown expiresAt={cat.badgeExpiresAt} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {badge && (
                                                        <div
                                                            style={badgeStyle}
                                                            className={`absolute top-0 right-0 px-4 py-1 ${badgeColorClass} text-white text-[9px] font-black uppercase tracking-tighter rounded-bl-2xl shadow-sm`}
                                                        >
                                                            {badge === 'PROMO' && cat.avgDiscount > 0
                                                                ? `-${cat.avgDiscount}% ${badgeLabel}`
                                                                : badgeLabel
                                                            }
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prediction Results */}
                    {query.length >= 2 && (
                        <>
                            <div className="p-4 border-b border-gray-50 bg-pixio-cream/50 flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Suggestions</span>
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                            </div>

                            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                                {results.length > 0 ? (
                                    <div className="p-4 space-y-3">
                                        {results.map((book) => (
                                            <Link
                                                key={book.id}
                                                href={`/books/${book.id}`}
                                                onClick={() => {
                                                    saveToHistory(query)
                                                    setIsOpen(false)
                                                }}
                                                className="flex items-center gap-4 p-4 hover:bg-pixio-beige/30 bg-white border border-gray-100 rounded-[1.5rem] transition-all group/item hover:border-black shadow-sm"
                                            >
                                                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50 shadow-sm transition-all group-hover/item:scale-105">
                                                    <Image
                                                        src={book.image}
                                                        alt={book.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{book.category || 'Collection'}</p>
                                                    <h4 className="font-black text-gray-900 text-sm truncate group-hover/item:text-black transition-colors leading-none">{book.title}</h4>
                                                    <p className="text-[10px] font-bold text-gray-500 italic">Par {book.author}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-sm font-black text-gray-900">{book.price} MAD</span>
                                                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0">
                                                            <ArrowRight className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : !isLoading && (
                                    <div className="p-16 text-center space-y-4 bg-pixio-cream/30">
                                        <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                                            <BookOpen className="w-10 h-10 text-gray-200" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">Oups !</p>
                                            <p className="text-[11px] font-bold text-gray-500 mt-1">Aucun livre ne correspond à votre recherche.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {results.length > 0 && (
                                <div className="p-4 bg-white border-t border-gray-50">
                                    <button
                                        onClick={handleSearch}
                                        className="w-full py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-black/20 group/all"
                                    >
                                        Voir tous les résultats
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/all:translate-x-1" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
