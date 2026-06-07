'use client'

import { useState } from 'react'
import MarketFiltersClient from './MarketFiltersClient'
import MarketProductCard from './MarketProductCard'
import ProductGridSkeleton from './ProductGridSkeleton'
import { Frown, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MarketClientSectionProps {
    initialBooks: any[]
    smartMatches: any[]
    search?: string
    city?: string
    isBlurred?: boolean
}

export default function MarketClientSection({ initialBooks, smartMatches, search, city, isBlurred }: MarketClientSectionProps) {
    const [isPending, setIsPending] = useState(false)
    const t = useTranslations('Community.Market')

    return (
        <div className="w-full">
            {/* Filters */}
            <MarketFiltersClient onPendingChange={setIsPending} />

            {/* Content Container */}
            <div className="relative min-h-[500px] w-full">
                {/* Overlay Skeleton during transitions */}
                {isPending && (
                    <div className="absolute inset-0 bg-pixio-cream/60 z-20 backdrop-blur-[2px] animate-in fade-in duration-300">
                        <ProductGridSkeleton />
                    </div>
                )}

                <div className={`transition-opacity duration-300 ${isPending ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    {/* Smart Matches Section (Hidden if searching/filtering) */}
                    {smartMatches.length > 0 && !search && !city && (
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                                    <Sparkles className="w-5 h-5 text-pixio-yellow" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-black tracking-tight uppercase">{t('MatchesForYou')}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('BasedOnWishlist')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {smartMatches.map((product: any) => (
                                    <MarketProductCard key={product.id} product={product} isSmartMatch isBlurred={isBlurred} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Grid Title */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-black rounded-full" />
                        <h2 className="text-2xl font-black text-black tracking-tight uppercase">{t('AllBooks')}</h2>
                    </div>

                    {/* Main Grid */}
                    {initialBooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {initialBooks.map((product: any) => (
                                <MarketProductCard key={product.id} product={product} isBlurred={isBlurred} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-dashed border-2 border-gray-100 shadow-inner">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Frown className="w-10 h-10 text-gray-200" />
                            </div>
                            <h2 className="text-2xl font-black text-black mb-2 uppercase">{t('NoResults')}</h2>
                            <p className="text-gray-400 font-bold max-w-sm text-center text-sm">
                                {t('TryFilters')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
