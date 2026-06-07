'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, Loader2, BookOpen, X, ArrowRight, Clock } from 'lucide-react'
import { searchBooksPredictive, getPopularSearches } from '@/lib/actions/search'
import Image from 'next/image'
// import Link from 'next/link' <-- use i18n link
import { Link, useRouter } from '@/i18n/routing'

import { trackBadgeClick } from '@/lib/actions/analytics'
import { useTranslations } from 'next-intl'
import { fbPixelEvents } from '@/lib/facebook-pixel'
import { normalizeImage } from '@/lib/utils'

const Countdown = ({ expiresAt }: { expiresAt: string | Date }) => {
    const [timeLeft, setTimeLeft] = useState('')
    const t = useTranslations('PredictiveSearch');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiresAt).getTime() - new Date().getTime()
            if (difference <= 0) return t('Terminated')

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
            <span>{t('EndsIn', { time: timeLeft })}</span>
        </div>
    )
}

export default function PredictiveSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [history, setHistory] = useState<string[]>([])

    const [popularSearches, setPopularSearches] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const t = useTranslations('PredictiveSearch');

    // Charger l'historique et les catégories au montage
    useEffect(() => {
        const savedHistory = localStorage.getItem('riwaya_search_history')
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory))
        }


        // Charger les recherches populaires
        getPopularSearches().then((data: any) => setPopularSearches(data))

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
                if (query.length === 0 && history.length > 0) {
                    // L'état isOpen est géré par onFocus
                } else {
                    setIsOpen(false)
                }
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, history.length])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            saveToHistory(query)
            fbPixelEvents.search(query.trim())
            router.push(`/products?search=${encodeURIComponent(query.trim())}`)
            setIsOpen(false)
        }
    }

    const handleHistoryClick = (searchTerm: string) => {
        setQuery(searchTerm)
        saveToHistory(searchTerm)
        router.push(`/products?search=${encodeURIComponent(searchTerm)}`)
        setIsOpen(false)
    }

    const handleCategoryClick = (category: string, badge?: string | null) => {
        if (badge) {
            trackBadgeClick(badge, category)
        }
        router.push(`/products?category=${encodeURIComponent(category)}`)
        setIsOpen(false)
    }

    return (
        <div ref={searchRef} className="relative w-full max-w-xl mx-auto group">
            {/* Form standard inspiré par Pixio */}
            <form onSubmit={handleSearch} className="relative group/input">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => (query.length >= 2 || history.length > 0) && setIsOpen(true)}
                    placeholder={t('Placeholder')}
                    className="w-full bg-white border-2 border-gray-100 focus:border-black rounded-[2rem] py-4 pl-14 pr-10 rtl:pr-14 rtl:pl-10 font-bold text-gray-900 transition-all outline-none placeholder:text-gray-400 shadow-sm focus:shadow-xl group-hover/input:border-gray-200"
                />
                <SearchIcon className={`absolute left-5 rtl:right-5 rtl:left-auto top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isOpen ? 'text-black' : 'text-gray-300'}`} />

                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-5 rtl:left-5 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </form>

            {/* Dropdown Results - Style Pixio */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[120%] min-w-[320px] md:min-w-[500px] mt-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">

                    {/* Suggestions si query vide */}
                    {query.length === 0 && (
                        <div className="p-4 space-y-6">
                            {/* Historique */}
                            {history.length > 0 && (
                                <div className="px-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">{t('RecentSearches')}</span>
                                        <button
                                            onClick={clearHistory}
                                            className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            {t('Clear')}
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
                            {/* Recherches populaires */}
                            {popularSearches.length > 0 && (
                                <div className="px-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">{t('PopularSearches')}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {popularSearches.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleHistoryClick(item)}
                                                className="px-4 py-2 bg-pixio-yellow/20 hover:bg-pixio-yellow rounded-full text-sm font-bold text-gray-900 transition-all font-bold"
                                            >
                                                ✨ {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </div>
                    )}

                    {/* Prediction Results */}
                    {query.length >= 2 && (
                        <>
                            <div className="p-4 border-b border-gray-50 bg-pixio-cream/50 flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">{t('Suggestions')}</span>
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                            </div>

                            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                                {results.length > 0 ? (
                                    <div className="p-4 space-y-3">
                                        {results.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.id}`}
                                                onClick={() => {
                                                    saveToHistory(query)
                                                    setIsOpen(false)
                                                }}
                                                className="flex items-center gap-4 p-4 hover:bg-pixio-beige/30 bg-white border border-gray-100 rounded-[1.5rem] transition-all group/item hover:border-black shadow-sm"
                                            >
                                                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50 shadow-sm transition-all group-hover/item:scale-105">
                                                    <Image
                                                        src={normalizeImage(product.image)}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{product.category || 'Collection'}</p>
                                                    <h4 className="font-black text-gray-900 text-sm truncate group-hover/item:text-black transition-colors leading-none">{product.title}</h4>
                                                    <p className="text-[10px] font-bold text-gray-500 italic">{t('By', { author: product.author })}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-sm font-black text-gray-900">{product.price} MAD</span>
                                                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0 rtl:translate-x-2 rtl:group-hover/item:translate-x-0">
                                                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
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
                                            <p className="text-sm font-black text-gray-900">{t('NoResultsTitle')}</p>
                                            <p className="text-[11px] font-bold text-gray-500 mt-1">{t('NoResultsDesc')}</p>
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
                                        {t('ViewAll')}
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/all:translate-x-1 rtl:rotate-180 rtl:group-hover/all:-translate-x-1" />
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
