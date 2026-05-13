'use client'

import { useRef, useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Users } from 'lucide-react'
import { Link } from '@/i18n/routing'
import ImageWithFallback from './ImageWithFallback'
import ScrollReveal from './ScrollReveal'
import { useTranslations } from 'next-intl'

interface Author {
    author: string
    totalSold: number
    bookCount: number
    sampleBook?: {
        image: string
    }
}

interface AuthorsCarouselProps {
    authors: Author[]
}

export default function AuthorsCarousel({ authors }: AuthorsCarouselProps) {
    const t = useTranslations('HomePage.BestAuthors')
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 10)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        const current = scrollRef.current
        if (current) {
            current.addEventListener('scroll', checkScroll)
            checkScroll()
            // Check again after a short delay for image loading/layout
            setTimeout(checkScroll, 500)
        }
        return () => current?.removeEventListener('scroll', checkScroll)
    }, [authors])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current
            const scrollAmount = clientWidth * 0.8
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (authors.length === 0) {
        return (
            <div className="text-center py-32 bg-pixio-cream rounded-[4rem] border-2 border-dashed border-gray-100">
                <Users className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em]">
                    {t('NoData')}
                </p>
            </div>
        )
    }

    return (
        <div className="relative group/carousel">
            {/* Scrollable Area */}
            <div 
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto pb-12 pt-12 no-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {authors.map((author, idx) => (
                    <div 
                        key={author.author} 
                        className="flex-shrink-0 w-[300px] md:w-[350px] snap-center"
                    >
                        <ScrollReveal delay={idx * 50} animation="animate-reveal-up">
                            <Link
                                href={`/authors/${encodeURIComponent(author.author)}`}
                                className="group/card relative flex flex-col pt-12"
                            >
                                {/* Rank Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-6xl font-black text-amber-400/40 leading-none group-hover/card:text-amber-400 transition-colors duration-500">
                                        0{idx + 1}
                                    </span>
                                    <div className="h-px flex-grow bg-gray-100 group-hover/card:bg-amber-100 transition-colors"></div>
                                </div>

                                {/* Main Card */}
                                <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-black/5 hover:shadow-black/10 border border-gray-50 transition-all duration-500 group-hover/card:-translate-y-4">
                                    <div className="relative flex flex-col items-center">
                                        {/* Author Image - Overlapping look */}
                                        <div className="relative w-32 h-32 -mt-20 mb-8 z-10">
                                            <div className="absolute inset-0 bg-black rounded-full rotate-6 group-hover/card:rotate-12 transition-transform duration-500 scale-105 shadow-lg"></div>
                                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                                                {author.sampleBook?.image ? (
                                                    <ImageWithFallback
                                                        src={author.sampleBook.image}
                                                        alt={author.author}
                                                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <Users className="w-10 h-10 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-black tracking-tight mb-8 text-center px-4 min-h-[3rem] flex items-center">
                                            {author.author}
                                        </h3>

                                        {/* Glassmorphism Stats */}
                                        <div className="w-full grid grid-cols-2 gap-4">
                                            <div className="relative p-6 bg-pixio-cream rounded-[2rem] overflow-hidden group/stat">
                                                <p className="text-2xl font-black text-black tracking-tighter mb-0.5 relative z-10">{author.totalSold}</p>
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] relative z-10">
                                                    {t('BooksSold')}
                                                </p>
                                            </div>
                                            <div className="relative p-6 bg-pixio-yellow/30 rounded-[2rem] overflow-hidden group/stat">
                                                <p className="text-2xl font-black text-amber-600 tracking-tighter mb-0.5 relative z-10">{author.bookCount}</p>
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] relative z-10">
                                                    {author.bookCount > 1 ? t('BooksPlural') : t('BookSingular')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Action Badge */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover/card:translate-y-4 group-hover/card:opacity-100 transition-all duration-500 pointer-events-none z-20">
                                    <div className="bg-black text-white px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                                        <span>{t('ViewBooks')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        </ScrollReveal>
                    </div>
                ))}
            </div>

            {/* Scroll Buttons - Desktop */}
            <div className="hidden md:flex justify-center items-center gap-6 mt-8">
                <button
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft}
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-105 ${
                        canScrollLeft 
                        ? 'border-black bg-black text-white hover:bg-gray-800 shadow-xl' 
                        : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight}
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-105 ${
                        canScrollRight 
                        ? 'border-black bg-black text-white hover:bg-gray-800 shadow-xl' 
                        : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Indicators */}
            <div className="flex md:hidden justify-center gap-2 mt-4">
                {authors.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${
                            i === 0 ? 'w-8 bg-black' : 'w-2 bg-gray-200'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}
