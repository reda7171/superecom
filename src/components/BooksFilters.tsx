'use client'

import { useState, useEffect, useRef } from 'react'

function AuthorCombobox({ 
    authors, 
    currentAuthor, 
    onChange, 
    isCondensed = false, 
    allAuthorsText 
}: { 
    authors: string[], 
    currentAuthor: string, 
    onChange: (author: string) => void, 
    isCondensed?: boolean, 
    allAuthorsText: string 
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredAuthors = authors.filter(a => a.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className={`relative ${isCondensed ? 'flex-1' : ''}`} ref={selectRef}>
            <div 
                className="relative cursor-pointer"
                onClick={() => {
                    if (!isOpen) {
                        setIsOpen(true);
                        setSearch('');
                    } else {
                        setIsOpen(false);
                    }
                }}
            >
                {isCondensed && <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />}
                
                {isOpen ? (
                    <input
                        type="text"
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={isCondensed 
                            ? "w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-900 focus:ring-0 outline-none" 
                            : "w-full px-6 py-4 bg-white border-2 border-black rounded-2xl outline-none font-bold text-sm text-gray-800"
                        }
                        placeholder="Rechercher..."
                    />
                ) : (
                    <div className={isCondensed
                        ? "w-full pl-10 pr-8 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap"
                        : "w-full px-6 pr-10 py-4 bg-[#F8F9FA] border-2 border-transparent rounded-2xl font-bold text-sm text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap"
                    }>
                        {currentAuthor || allAuthorsText}
                    </div>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[60] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-auto">
                    <ul className="py-1">
                        <li
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer text-xs font-bold ${!currentAuthor ? 'text-black' : 'text-gray-500'}`}
                            onClick={() => {
                                setIsOpen(false);
                                onChange('');
                            }}
                        >
                            {allAuthorsText}
                        </li>
                        {filteredAuthors.map((author) => (
                            <li
                                key={author}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer text-xs font-bold ${currentAuthor === author ? 'text-black' : 'text-gray-500'}`}
                                onClick={() => {
                                    setIsOpen(false);
                                    onChange(author);
                                }}
                            >
                                {author}
                            </li>
                        ))}
                        {filteredAuthors.length === 0 && (
                            <li className="px-4 py-3 text-xs text-gray-400 italic">Aucun auteur trouvé</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
import { Filter, SlidersHorizontal, Globe, User, X, ChevronDown, Search } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

interface BooksFiltersProps {
    params: {
        category?: string
        search?: string
        language?: string
        inStock?: string
        author?: string
    }
    categories: string[]
    authors: string[]
    languages: { code: string; label: string }[]
    totalCount: number
}

export default function BooksFilters({ params, categories, authors, languages, totalCount }: BooksFiltersProps) {
    const t = useTranslations('BooksPage')
    const tCats = useTranslations('Categories')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isAllCatsRevealed, setIsAllCatsRevealed] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleAuthorChange = (value: string) => {
        const newParams = new URLSearchParams()
        if (value) newParams.set('author', value)
        if (params.search) newParams.set('search', params.search)
        if (params.category) newParams.set('category', params.category)
        if (params.language) newParams.set('language', params.language)
        if (params.inStock) newParams.set('inStock', params.inStock)
        router.push(`/books?${newParams.toString()}`)
    }

    const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked
        const newParams = new URLSearchParams()
        if (params.search) newParams.set('search', params.search)
        if (params.author) newParams.set('author', params.author)
        if (params.category) newParams.set('category', params.category)
        if (params.language) newParams.set('language', params.language)
        newParams.set('inStock', value ? 'true' : 'false')
        router.push(`/books?${newParams.toString()}`)
    }

    const [openSections, setOpenSections] = useState({
        langs: true,
        cats: true
    })

    const toggleSection = (section: 'langs' | 'cats') => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const resetFilters = () => {
        router.push('/books')
        setIsMobileMenuOpen(false)
    }

    const FilterContent = ({ isMobile = false }) => (
        <div className={`space-y-3 ${isMobile ? 'pb-20' : ''}`}>
            {!isMobile && (
                <div className="flex items-center gap-4 mb-2 pb-2 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                        <SlidersHorizontal className="w-5 h-5 text-gray-100" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">{t('Filters')}</h2>
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                            Affiner la recherche
                        </p>
                    </div>
                </div>
            )}

            {/* Author Search */}
            <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 ml-1">
                    <User className="w-3 h-3" />
                    {t('SearchItems')}
                </label>
                <AuthorCombobox 
                    authors={authors}
                    currentAuthor={params.author || ''}
                    onChange={handleAuthorChange}
                    allAuthorsText={t('AllAuthors') || 'Tous les auteurs'}
                />
            </div>

            {/* Disponibilité */}
            <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={params.inStock === undefined ? true : params.inStock === 'true'}
                            onChange={handleInStockChange}
                        />
                        <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">
                        Disponible
                    </span>
                </label>
            </div>

            {/* Languages */}
            <div>
                <button 
                    onClick={() => toggleSection('langs')}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <Globe className="w-3 h-3" />
                        {t('Languages')}
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openSections.langs ? 'rotate-180' : ''}`} />
                </button>
                {openSections.langs && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Link
                            href={`/books?${new URLSearchParams({
                                ...(params.category ? { category: params.category } : {}),
                                ...(params.search ? { search: params.search } : {}),
                                ...(params.author ? { author: params.author } : {}),
                                ...(params.inStock ? { inStock: params.inStock } : {}),
                            }).toString()}`}
                            scroll={false}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!params.language
                                ? 'bg-black text-white shadow-lg'
                                : 'bg-[#F8F9FA] text-gray-400 hover:text-black'
                                }`}
                            onClick={() => isMobile && setIsMobileMenuOpen(false)}
                        >
                            {t('AllLanguages')}
                        </Link>
                        {languages.map((lang) => (
                            <Link
                                key={lang.code}
                                href={`/books?${new URLSearchParams({
                                    ...(params.category ? { category: params.category } : {}),
                                    ...(params.search ? { search: params.search } : {}),
                                    ...(params.author ? { author: params.author } : {}),
                                    ...(params.inStock ? { inStock: params.inStock } : {}),
                                    language: lang.code
                                }).toString()}`}
                                scroll={false}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${params.language === lang.code
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-[#F8F9FA] text-gray-400 hover:text-black'
                                    }`}
                                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                            >
                                {lang.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Categories */}
            <div>
                <button 
                    onClick={() => toggleSection('cats')}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <Filter className="w-3 h-3" />
                        {t('Categories')}
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openSections.cats ? 'rotate-180' : ''}`} />
                </button>
                {openSections.cats && (
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Link
                            href={`/books?${new URLSearchParams({
                                ...(params.language ? { language: params.language } : {}),
                                ...(params.search ? { search: params.search } : {}),
                                ...(params.author ? { author: params.author } : {}),
                                ...(params.inStock ? { inStock: params.inStock } : {}),
                            }).toString()}`}
                            scroll={false}
                            className={`px-4 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!params.category
                                ? 'bg-black text-white shadow-lg'
                                : 'bg-[#F8F9FA] text-gray-400 hover:text-black lg:hover:bg-pixio-cream/50'
                                }`}
                            onClick={() => isMobile && setIsMobileMenuOpen(false)}
                        >
                            {tCats('All')}
                        </Link>
                        {categories.slice(0, isAllCatsRevealed ? categories.length : 3).map((category) => (
                            <Link
                                key={category}
                                href={`/books?${new URLSearchParams({
                                    category: category,
                                    ...(params.language ? { language: params.language } : {}),
                                    ...(params.search ? { search: params.search } : {}),
                                    ...(params.author ? { author: params.author } : {}),
                                    ...(params.inStock ? { inStock: params.inStock } : {})
                                }).toString()}`}
                                scroll={false}
                                className={`px-4 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${params.category === category
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-[#F8F9FA] text-gray-400 hover:text-black lg:hover:bg-pixio-cream/50'
                                    }`}
                                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                            >
                                {tCats.has(category as any) ? tCats(category as any) : category}
                            </Link>
                        ))}
                        {categories.length > 3 && (
                            <button
                                onClick={() => setIsAllCatsRevealed(!isAllCatsRevealed)}
                                className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                            >
                                {isAllCatsRevealed ? '- Afficher moins' : '+ Afficher plus'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Active Filters */}
            {(params.category || params.search || params.language || params.inStock) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('Active')}</span>
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                        >
                            {t('Reset')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-3xl p-8 sticky top-28 shadow-xl shadow-gray-200/40 border border-gray-100 transition-all hover:shadow-2xl">
                    <FilterContent />
                </div>
            </aside>

            {/* Mobile Sticky Top Bar */}
            <div className={`lg:hidden fixed left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'top-20' : 'top-[80px]'}`}>
                <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center gap-2">
                        {/* Search Author Select (Condensed) */}
                        <AuthorCombobox 
                            authors={authors}
                            currentAuthor={params.author || ''}
                            onChange={handleAuthorChange}
                            allAuthorsText={t('AllAuthors') || 'Tous les auteurs'}
                            isCondensed={true}
                        />

                        {/* Filter Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                params.category || params.language || params.author || params.inStock 
                                ? 'bg-black text-white shadow-lg' 
                                : 'bg-gray-100 text-gray-900'
                            }`}
                            aria-label={t('Filters')}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('Filters')}</span>
                            {(params.category || params.language || params.author || params.inStock) && (
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                        </button>
                    </div>

                    {/* Active Chips Horizontal Scroll */}
                    {(params.category || params.language || params.search || params.author || params.inStock) && (
                        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                            {params.category && (
                                <div className="flex-shrink-0 px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    {tCats.has(params.category as any) ? tCats(params.category as any) : params.category}
                                    <Link 
                                        href={`/books?${new URLSearchParams({
                                            ...(params.language ? { language: params.language } : {}),
                                            ...(params.search ? { search: params.search } : {}),
                                            ...(params.author ? { author: params.author } : {}),
                                            ...(params.inStock ? { inStock: params.inStock } : {})
                                        }).toString()}`} 
                                        scroll={false}
                                        className="opacity-50"
                                    >×</Link>
                                </div>
                            )}
                            {params.language && (
                                <div className="flex-shrink-0 px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    {languages.find(l => l.code === params.language)?.label || params.language}
                                    <Link 
                                        href={`/books?${new URLSearchParams({
                                            ...(params.category ? { category: params.category } : {}),
                                            ...(params.search ? { search: params.search } : {}),
                                            ...(params.author ? { author: params.author } : {}),
                                            ...(params.inStock ? { inStock: params.inStock } : {})
                                        }).toString()}`} 
                                        scroll={false}
                                        className="opacity-50"
                                    >×</Link>
                                </div>
                            )}
                            {params.author && (
                                <div className="flex-shrink-0 px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    {params.author}
                                    <Link 
                                        href={`/books?${new URLSearchParams({
                                            ...(params.category ? { category: params.category } : {}),
                                            ...(params.language ? { language: params.language } : {}),
                                            ...(params.search ? { search: params.search } : {}),
                                            ...(params.inStock ? { inStock: params.inStock } : {})
                                        }).toString()}`} 
                                        scroll={false}
                                        className="opacity-50"
                                    >×</Link>
                                </div>
                            )}
                            {(params.inStock === undefined || params.inStock === 'true') && (
                                <div className="flex-shrink-0 px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    Disponible
                                    <Link 
                                        href={`/books?${new URLSearchParams({
                                            ...(params.category ? { category: params.category } : {}),
                                            ...(params.search ? { search: params.search } : {}),
                                            ...(params.language ? { language: params.language } : {}),
                                            ...(params.author ? { author: params.author } : {}),
                                            inStock: 'false'
                                        }).toString()}`} 
                                        scroll={false}
                                        className="opacity-50"
                                    >×</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">{t('Filters')}</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Affiner la recherche</p>
                            </div>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-900" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <FilterContent isMobile />
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-all"
                            >
                                Voir les {totalCount} résultats
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
