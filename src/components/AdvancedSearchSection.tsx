'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { Search, ChevronDown, ChevronUp, SlidersHorizontal, BookOpen, User, Tag } from 'lucide-react'
import ScrollReveal from '@/components/ScrollReveal'
import { useTranslations } from 'next-intl'

export default function AdvancedSearchSection() {
    const router = useRouter()
    const t = useTranslations('HomePage.SearchSection')
    const [isAdvanced, setIsAdvanced] = useState(false)
    const [formData, setFormData] = useState({
        search: '',
        title: '',
        author: '',
        minPrice: '',
        maxPrice: ''
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams()

        if (formData.search) params.append('search', formData.search)
        if (formData.title) params.append('title', formData.title)
        if (formData.author) params.append('author', formData.author)
        if (formData.minPrice) params.append('minPrice', formData.minPrice)
        if (formData.maxPrice) params.append('maxPrice', formData.maxPrice)

        router.push(`/books?${params.toString()}`)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <section className="py-24 bg-pixio-cream relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-pixio-yellow/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pixio-beige/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <ScrollReveal className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm mb-4">
                        <Search className="w-3.5 h-3.5 text-black" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            {t('Badge')}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight mb-4">
                        {t('TitlePart1')} <span className="text-gray-400">{t('TitlePart2')}</span>
                    </h2>
                    <p className="text-gray-500 font-medium max-w-lg mx-auto">
                        {t('Description')}
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <form onSubmit={handleSearch} className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-black/5 border border-gray-50 transition-all hover:shadow-2xl hover:shadow-black/10">
                        {/* Barre de recherche principale */}
                        <div className="relative group">
                            <input
                                type="text"
                                name="search"
                                value={formData.search}
                                onChange={handleChange}
                                placeholder={t('Placeholder')}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl py-4 pl-12 pr-4 rtl:pr-12 rtl:pl-4 font-bold text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:bg-white"
                            />
                            <Search className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        </div>

                        {/* Toggle Advanced */}
                        <div className="flex justify-center mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAdvanced(!isAdvanced)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors group"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>{isAdvanced ? t('HideFilters') : t('MoreFilters')}</span>
                                {isAdvanced ? (
                                    <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                )}
                            </button>
                        </div>

                        {/* Champs Avancés */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden transition-all duration-500 ease-in-out ${isAdvanced ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>

                            {/* Titre */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">{t('Filters.Title')}</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder={t('Filters.TitlePlaceholder')}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl py-3 pl-10 pr-4 rtl:pr-10 rtl:pl-4 font-bold text-sm text-gray-900 transition-all outline-none focus:bg-white"
                                    />
                                    <BookOpen className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                </div>
                            </div>

                            {/* Auteur */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">{t('Filters.Author')}</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        placeholder={t('Filters.AuthorPlaceholder')}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl py-3 pl-10 pr-4 rtl:pr-10 rtl:pl-4 font-bold text-sm text-gray-900 transition-all outline-none focus:bg-white"
                                    />
                                    <User className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                </div>
                            </div>

                            {/* Prix Min */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">{t('Filters.MinPrice')}</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        name="minPrice"
                                        value={formData.minPrice}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl py-3 pl-10 pr-4 rtl:pr-10 rtl:pl-4 font-bold text-sm text-gray-900 transition-all outline-none focus:bg-white"
                                    />
                                    <Tag className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                </div>
                            </div>

                            {/* Prix Max */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">{t('Filters.MaxPrice')}</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        name="maxPrice"
                                        value={formData.maxPrice}
                                        onChange={handleChange}
                                        placeholder="1000"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-200 rounded-xl py-3 pl-10 pr-4 rtl:pr-10 rtl:pl-4 font-bold text-sm text-gray-900 transition-all outline-none focus:bg-white"
                                    />
                                    <Tag className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                className="w-full py-4 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {t('Submit')}
                            </button>
                        </div>
                    </form>
                </ScrollReveal>
            </div>
        </section>
    )
}
