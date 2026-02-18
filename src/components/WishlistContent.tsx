'use client'

import { useWishlistStore } from '@/store/wishlist'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import WishlistButton from '@/components/WishlistButton'
import { ShoppingBag, Heart, Sparkles, ArrowRight, Zap, LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface WishlistContentProps {
    isAuthenticated?: boolean
}

export default function WishlistContent({ isAuthenticated = false }: WishlistContentProps) {
    const items = useWishlistStore((state) => state.items)
    const { addItem } = useCartStore()
    const { openCart, showNotification } = useUIStore()
    const t = useTranslations('Wishlist')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-pixio-cream">
                <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin" />
            </div>
        )
    }

    const moveToCart = (item: any) => {
        addItem({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            type: item.type
        })
        showNotification(t('AddToCart'), 'success')
        openCart()
    }

    const addAllToCart = () => {
        items.forEach(item => {
            addItem({
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image,
                type: item.type
            })
        })
        showNotification(t('AddAllToCart'), 'success')
        openCart()
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-pixio-cream relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-1/4 -left-20 w-64 h-64 bg-pixio-yellow/20 rounded-full blur-[100px] animate-pulse lg:animate-none" />
                <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-black/5 rounded-full blur-[100px]" />

                <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-black shadow-2xl rotate-3">
                            <Heart className="w-12 h-12 fill-black" />
                        </div>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-pixio-yellow rounded-full flex items-center justify-center shadow-xl animate-bounce">
                            <Sparkles className="w-6 h-6 text-black" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter leading-none">
                            {t('EmptyTitle')}<span className="text-gray-300">.</span>
                        </h1>
                        <p className="text-gray-400 max-w-sm font-bold mx-auto text-lg uppercase tracking-widest leading-relaxed">
                            {t('EmptyDesc')}
                        </p>
                    </div>

                    <Link
                        href="/books"
                        className="inline-flex items-center gap-4 px-10 py-6 bg-black text-white rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition-all hover:scale-105 shadow-2xl hover:shadow-black/20 group"
                    >
                        <span>{t('ContinueShopping')}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        )
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'url': `${typeof window !== 'undefined' ? window.location.origin : ''}${item.slug}`,
            'name': item.title,
            'image': item.image
        }))
    }

    return (
        <div className="min-h-screen bg-pixio-cream pb-32">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Dynamic Header */}
            <div className="relative bg-black text-white py-24 lg:py-32 overflow-hidden mb-16">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-transparent to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-pixio-yellow text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                                    <Heart className="w-3 h-3 fill-black" />
                                    {t('Subtitle', { count: items.length })}
                                </div>
                                <button
                                    onClick={addAllToCart}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-pixio-yellow transition-all active:scale-95 shadow-lg group"
                                >
                                    <Zap className="w-3 h-3 fill-black group-hover:scale-125 transition-transform" />
                                    {t('AddAllToCart')}
                                </button>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                                {t('Title')}<span className="text-pixio-yellow">.</span>
                            </h1>
                        </div>

                        {!isAuthenticated && (
                            <Link
                                href="/community/login"
                                className="inline-flex items-center gap-6 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group max-w-md"
                            >
                                <div className="w-14 h-14 bg-pixio-yellow rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                                    <Zap className="w-7 h-7 text-black fill-black" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black uppercase text-xs tracking-widest text-pixio-yellow">Synchroniser</p>
                                    <p className="text-sm font-medium text-gray-300 leading-relaxed">
                                        Connectez-vous pour sauvegarder ces pépites sur tous vos appareils.
                                    </p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            className="group relative flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Card Background Glow */}
                            <div className="absolute -inset-4 bg-white rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl shadow-black/5" />

                            {/* Card Content */}
                            <div className="relative z-10 flex flex-col h-full">
                                {/* Image Wrapper */}
                                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 group-hover:scale-[1.02] transition-transform duration-700">
                                    <Link href={item.slug} className="absolute inset-0 z-10" />
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            unoptimized
                                        />
                                    )}
                                    {/* Action Overlays */}
                                    <div className="absolute top-6 right-6 z-20">
                                        <WishlistButton
                                            item={item}
                                            className="bg-white/90 backdrop-blur-md shadow-2xl hover:bg-white w-12 h-12 rounded-full"
                                        />
                                    </div>
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <div className="px-5 py-2.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                                            {item.type === 'BOOK' ? 'Livre' : 'Pack'}
                                        </div>
                                    </div>
                                </div>

                                {/* Typography */}
                                <div className="px-4 space-y-4 flex-grow flex flex-col">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-black leading-tight tracking-tighter line-clamp-2 min-h-[4rem]">
                                            <Link href={item.slug} className="hover:text-pixio-yellow transition-colors">{item.title}</Link>
                                        </h3>
                                        {item.author && (
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                {t('By', { author: item.author })}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price & Action */}
                                    <div className="mt-auto pt-8 flex items-center justify-between">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-black tracking-tighter">{item.price}</span>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">MAD</span>
                                        </div>

                                        <button
                                            onClick={() => moveToCart(item)}
                                            className="w-14 h-14 bg-black text-white rounded-[1.5rem] flex items-center justify-center hover:bg-pixio-yellow hover:text-black transition-all shadow-xl hover:shadow-pixio-yellow/20 active:scale-90 group/btn"
                                            title={t('AddToCart')}
                                        >
                                            <ShoppingBag className="w-6 h-6 transition-transform group-hover/btn:-translate-y-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommend Section Decoration */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-48">
                <div className="bg-white rounded-[4rem] p-16 text-center border border-gray-100 shadow-2xl shadow-black/5 relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-black text-black tracking-tighter italic leading-none">
                            "{t('Quote')}"
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                            {t('QuoteSubtitle')}
                        </p>
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-pixio-cream rounded-full opacity-50" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pixio-cream rounded-full opacity-50" />
                </div>
            </div>
        </div>
    )
}
