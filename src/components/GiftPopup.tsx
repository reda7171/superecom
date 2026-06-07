'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Gift, Package, Sparkles, Command } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function GiftPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const t = useTranslations('Promotion')

    useEffect(() => {
        setMounted(true)
        const hasSeenPopup = localStorage.getItem('gift_popup_seen')
        
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 3000) // Apparition après 3 secondes
            return () => clearTimeout(timer)
        }
    }, [])

    const closePopup = () => {
        setIsOpen(false)
        localStorage.setItem('gift_popup_seen', 'true')
    }

    if (!mounted || !isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] animate-zoom-in">
                {/* Close Button */}
                <button 
                    onClick={closePopup}
                    className="absolute top-6 right-6 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors group"
                >
                    <X className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Image Section */}
                    <div className="relative w-full md:w-5/12 h-48 md:h-auto overflow-hidden">
                        <Image
                            src="/images/gift_promo.png"
                            alt="Gifts Promotion"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
                        
                        <div className="absolute bottom-4 left-4 md:bottom-auto md:top-8 md:right-[-20px] -rotate-12 md:rotate-12 bg-[#10b981] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                            {t('Offered')}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
                                <Gift className="w-5 h-5 text-[#10b981]" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10b981]">
                                {t('SpecialPromotion')}
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black text-black leading-none mb-4 tracking-tighter">
                            {t('GiftWaiting')} <span className="text-[#10b981]">.</span>
                        </h2>

                        <p className="text-gray-500 text-sm md:text-base mb-8 leading-relaxed">
                            {t('GiftDescription')}
                        </p>

                        <div className="space-y-4 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-black mb-0.5">{t('BookmarksTitle')}</h4>
                                    <p className="text-[11px] text-gray-400">{t('BookmarksDesc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Package className="w-3 h-3 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-black mb-0.5">{t('RandomBookTitle')}</h4>
                                    <p className="text-[11px] text-gray-400">{t('RandomBookDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={closePopup}
                            className="group relative w-full bg-black hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-[0.15em] py-5 rounded-2xl transition-all duration-300 shadow-2xl overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {t('ExploreBtn')}
                                <Command className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </button>
                        
                        <p className="mt-4 text-[10px] text-center text-gray-300 uppercase tracking-widest font-medium">
                            {t('ValidToday')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
