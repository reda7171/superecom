'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ProductFilters } from '@/lib/db/products'
import { fetchBooks } from '@/lib/actions/products'
import ProductCard from '@/components/ProductCard'
import AdBanner from '@/components/AdBanner'
import { Product } from '@prisma/client'
import { Link } from '@/i18n/routing'
import { Package, ArrowRight, Sparkles } from 'lucide-react'
import ImageWithFallback from '@/components/ImageWithFallback'
import { useTranslations } from 'next-intl'

interface InfiniteProductListProps {
    initialBooks: Product[]
    initialFilters: ProductFilters
    adsense?: {
        enabled: boolean
        publisherId: string
        slotId: string
    }
    packsCTA?: any[]
}

export default function InfiniteProductList({ initialBooks, initialFilters, adsense, packsCTA = [] }: InfiniteProductListProps) {
    const [products, setBooks] = useState<Product[]>(initialBooks)
    const [page, setPage] = useState(2)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const tCommon = useTranslations('Common')
    const observerTarget = useRef<HTMLDivElement>(null)

    // Pack aléatoire sélectionné uniquement côté client pour éviter l'hydratation mismatch
    const [randomPack, setRandomPack] = useState<any>(null)
    useEffect(() => {
        if (packsCTA && packsCTA.length > 0) {
            setRandomPack(packsCTA[Math.floor(Math.random() * packsCTA.length)])
        }
    }, [packsCTA])

    // Reset state when initialBooks changes (filtering)
    useEffect(() => {
        setBooks(initialBooks)
        setPage(2)
        setHasMore(initialBooks.length >= (initialFilters.limit || 12))
    }, [initialBooks, initialFilters])

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setLoading(true)
                    try {
                        const nextFilters = { ...initialFilters, page: page, limit: initialFilters.limit || 12 }
                        const result = await fetchBooks(nextFilters)

                        if (result.success && result.data) {
                            if (result.data.length < (initialFilters.limit || 12)) {
                                setHasMore(false)
                            }
                            // Avoid duplicates just in case
                            setBooks(prev => {
                                const newBooks = result.data.filter((newBook: Product) => !prev.some(b => b.id === newBook.id))
                                return [...prev, ...newBooks]
                            })
                            setPage(prev => prev + 1)
                        } else {
                            setHasMore(false)
                        }
                    } catch (e) {
                        console.error(e)
                        setHasMore(false)
                    } finally {
                        setLoading(false)
                    }
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [hasMore, loading, page, initialFilters])

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {products.map((product, index) => {
                    // Afficher une pub tous les 8 livres (après la 2ème ligne sur desktop)
                    const showAd = adsense?.enabled && adsense?.publisherId && adsense?.slotId && index > 0 && index % 8 === 0

                    // Afficher un CTA pack tous les 12 livres (index 11, 23, 35...)
                    const isCtaPosition = index > 0 && (index + 1) % 12 === 0;
                    const ctaIndex = Math.floor(index / 12);
                    let ctaBlock = null;

                    if (isCtaPosition) {
                        // Alterner entre le pack aléatoire (si dispo) et le custom pack builder
                        if (ctaIndex % 2 === 0 && randomPack) {
                            const pack = randomPack;
                            ctaBlock = (
                                <div className="col-span-2 md:col-span-3 xl:col-span-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-2xl my-4">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                                    
                                    <div className="flex-1 relative z-10 text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md mb-4 border border-white/10">
                                            <Sparkles className="w-4 h-4 text-purple-300" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-purple-100">{tCommon('SpecialOffer')}</span>
                                        </div>
                                        <h3 className="text-2xl md:text-4xl font-black mb-3">{pack.name}</h3>
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                            <span className="text-3xl md:text-4xl font-black text-purple-300">{pack.price} {tCommon('Currency')}</span>
                                        </div>
                                        <Link 
                                            href={`/packs/${pack.id}`} 
                                            className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
                                        >
                                            {tCommon('DiscoverPack')}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    <div className="flex -space-x-4 md:-space-x-8 relative z-10 items-center justify-center">
                                        {pack.products.slice(0, 4).map((pb: any, i: number) => (
                                            <div key={pb.id} className="w-24 h-36 md:w-32 md:h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 transform transition-transform hover:-translate-y-4 hover:rotate-2 relative z-10" style={{ zIndex: 10 - i }}>
                                                <ImageWithFallback 
                                                    src={pb.product.image || ''} 
                                                    alt={pb.product.title} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        } else {
                            ctaBlock = (
                                <div className="col-span-2 md:col-span-3 xl:col-span-4 bg-pixio-cream rounded-[2.5rem] p-6 md:p-10 border border-black/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm my-4">
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 bg-black/5 px-4 py-2 rounded-full mb-4">
                                            <Package className="w-4 h-4 text-black" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-black">{tCommon('CustomPackCTA.Tag')}</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black mb-3 text-black">{tCommon('CustomPackCTA.Title')}</h3>
                                        <p className="text-gray-600 text-sm font-medium mb-6 max-w-md">
                                            {tCommon('CustomPackCTA.Description')}
                                        </p>
                                        <Link 
                                            href="/packs?custom=true" 
                                            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all shadow-xl"
                                        >
                                            {tCommon('CustomPackCTA.Button')}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="hidden md:flex items-center justify-center relative w-48 h-48">
                                        <div className="absolute inset-0 border-4 border-dashed border-black/10 rounded-full animate-spin-slow"></div>
                                        <Package className="w-20 h-20 text-black/20" />
                                    </div>
                                </div>
                            );
                        }
                    }

                    return (
                        <React.Fragment key={product.id}>
                            <ProductCard {...product} />
                            {ctaBlock}
                            {showAd && (
                                <div className="col-span-2 md:col-span-3 xl:col-span-4 py-4">
                                    <AdBanner publisherId={adsense.publisherId} slotId={adsense.slotId} />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>

            {hasMore && (
                <div ref={observerTarget} className="mt-10">
                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100/50 shadow-sm h-full flex flex-col p-4 animate-pulse lg:animate-none">
                                    <div className="aspect-square bg-gray-100 rounded-[1.5rem] mb-6"></div>
                                    <div className="space-y-3 px-2">
                                        <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto"></div>
                                        <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto"></div>
                                        <div className="h-8 bg-gray-100 rounded-full w-full mt-4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!hasMore && products.length > 0 && (
                <div className="text-center p-10 text-gray-400 text-xs font-black uppercase tracking-widest">
                    Fin de la collection
                </div>
            )}
        </>
    )
}
