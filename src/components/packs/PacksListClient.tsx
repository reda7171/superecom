'use client'

import { useState, useMemo } from 'react'
import PackCard from '@/components/PackCard'
import { Package, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import CustomPackBuilder from './CustomPackBuilder'

interface PacksListClientProps {
    packs: any[]
    availableBooks: any[]
}

export default function PacksListClient({ packs, availableBooks }: PacksListClientProps) {
    const t = useTranslations('PacksPage')
    const tCommon = useTranslations('Common')
    const [filterAvailable, setFilterAvailable] = useState(false)

    const filteredPacks = useMemo(() => {
        if (!filterAvailable) return packs
        
        return packs.filter(pack => {
            // A pack is considered available if it has at least one product in stock
            // This allows partial packs to be shown if the user wants to replace missing products.
            return pack.products.some((pb: any) => pb.product.stock > 0)
        })
    }, [packs, filterAvailable])

    if (packs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-pixio-cream rounded-full flex items-center justify-center mx-auto mb-8">
                    <Package className="w-10 h-10 text-black/10" />
                </div>
                <h3 className="text-2xl font-black text-black mb-4">{t('NoCollections')}</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('Curating')}</p>
            </div>
        )
    }

    return (
        <>
            {/* Custom Pack Builder */}
            <CustomPackBuilder availableBooks={availableBooks} />

            {/* Filter */}
            <div className="flex justify-end mb-10">
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

            {/* Benefits Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-6 group hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-pixio-beige rounded-full flex items-center justify-center shrink-0">
                        <span className="text-2xl font-black text-black tracking-tighter">%</span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Benefits.HighSavings.Title')}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{t('Benefits.HighSavings.Desc')}</p>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-6 group hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-pixio-pink rounded-full flex items-center justify-center shrink-0">
                        <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Benefits.CuratedMix.Title')}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{t('Benefits.CuratedMix.Desc')}</p>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-6 group hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-pixio-yellow rounded-full flex items-center justify-center shrink-0">
                        <Package className="w-8 h-8 text-black" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Benefits.ExpressPack.Title')}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{t('Benefits.ExpressPack.Desc')}</p>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredPacks.length > 0 ? (
                    filteredPacks.map((pack) => (
                        <PackCard
                            key={pack.id}
                            {...pack}
                            products={pack.products.map((pb: any) => ({
                                product: {
                                    ...pb.product,
                                    price: pb.product.price
                                }
                            }))}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-black mb-4">Aucun pack disponible</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Veuillez modifier vos filtres</p>
                    </div>
                )}
            </div>
        </>
    )
}
