'use client'

import { useState, useMemo } from 'react'
import { Search, User, ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import ScrollReveal from '@/components/ScrollReveal'
import { useTranslations } from 'next-intl'

interface AuthorData {
    name: string
    bio?: string | null
    image?: string | null
    bookCount: number
    sampleBookImage?: string | null
    hasAvailableBooks: boolean
}

interface AuthorsListClientProps {
    authors: AuthorData[]
    locale: string
}

export default function AuthorsListClient({ authors, locale }: AuthorsListClientProps) {
    const t = useTranslations('AuthorsPage')
    const tCommon = useTranslations('Common')
    const [search, setSearch] = useState('')
    const [filterAvailable, setFilterAvailable] = useState(false)

    const filteredAuthors = useMemo(() => {
        let result = authors

        if (filterAvailable) {
            result = result.filter(a => a.hasAvailableBooks)
        }

        if (search) {
            const s = search.toLowerCase()
            result = result.filter(a => 
                a.name.toLowerCase().includes(s) || 
                a.bio?.toLowerCase().includes(s)
            )
        }

        return result
    }, [authors, search, filterAvailable])

    // Group authors by first letter for a nice index
    const groupedAuthors = useMemo(() => {
        const groups: Record<string, AuthorData[]> = {}
        filteredAuthors.forEach(author => {
            const letter = author.name.trim()[0]?.toUpperCase() || '#'
            if (!groups[letter]) groups[letter] = []
            groups[letter].push(author)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [filteredAuthors])

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <div className="relative max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input 
                                type="text"
                                placeholder={t('SearchPlaceholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-16 pr-8 py-6 bg-white border-none rounded-full shadow-2xl shadow-black/5 text-lg font-medium outline-none focus:ring-2 focus:ring-black transition-all"
                            />
                        </div>
                        {/* Toggle Disponible */}
                        <button
                            onClick={() => setFilterAvailable(!filterAvailable)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap shadow-xl ${
                                filterAvailable 
                                    ? 'bg-black text-white' 
                                    : 'bg-white text-gray-400 hover:text-black'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${filterAvailable ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                            {tCommon('Available')}
                        </button>
                    </div>
                </div>

                {/* Alphabet Index (Quick Scroll) */}
                {!search && (
                    <div className="flex flex-wrap justify-center gap-2 mb-16">
                        {alphabet.map(letter => (
                            <button
                                key={letter}
                                onClick={() => {
                                    const el = document.getElementById(`letter-${letter}`)
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all
                                    ${groupedAuthors.find(([l]) => l === letter) 
                                        ? 'bg-white text-black hover:bg-black hover:text-white shadow-sm' 
                                        : 'text-gray-300 cursor-not-allowed'}`}
                                disabled={!groupedAuthors.find(([l]) => l === letter)}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid / List */}
                <div className="space-y-20">
                    {groupedAuthors.length > 0 ? (
                        groupedAuthors.map(([letter, list]) => (
                            <div key={letter} id={`letter-${letter}`} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-black">
                                        {letter}
                                    </div>
                                    <div className="h-px flex-grow bg-gray-200"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {list.map((author, idx) => (
                                        <ScrollReveal key={author.name} delay={idx * 50} animation="animate-reveal-up">
                                            <Link 
                                                href={`/authors/${encodeURIComponent(author.name)}`}
                                                className="group flex items-center gap-6 p-6 bg-white rounded-3xl border border-transparent hover:border-black transition-all duration-300 hover:shadow-xl"
                                            >
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                                    {(author.image || author.sampleBookImage) ? (
                                                        <img 
                                                            src={author.image || author.sampleBookImage!} 
                                                            alt={author.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="text-lg font-black text-black truncate group-hover:text-pixio-pink transition-colors">
                                                        {author.name}
                                                    </h3>
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                        {t('BooksCount', { count: author.bookCount })}
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-pixio-cream flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </Link>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
                            <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em]">
                                {t('NoResults')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
