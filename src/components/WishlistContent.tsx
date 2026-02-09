'use client'

import { useWishlistStore } from '@/store/wishlist'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import WishlistButton from '@/components/WishlistButton'
import { ShoppingBag, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import { LogIn } from 'lucide-react'

interface WishlistContentProps {
    isAuthenticated?: boolean
}

export default function WishlistContent({ isAuthenticated = false }: WishlistContentProps) {
    const items = useWishlistStore((state) => state.items)
    const { addItem } = useCartStore()
    const { openCart } = useUIStore()
    const t = useTranslations('Wishlist')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 px-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                    <Heart className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{t('EmptyTitle')}</h1>
                    <p className="text-gray-500 max-w-sm font-medium mx-auto text-lg">{t('EmptyDesc')}</p>
                </div>
                <Link
                    href="/books"
                    className="px-8 py-4 bg-black text-white rounded-full font-black uppercase tracking-wider hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl mt-4 inline-flex items-center gap-2"
                >
                    {t('ContinueShopping')}
                </Link>
            </div>
        )
    }

    const moveToCart = (item: any) => {
        addItem({ ...item, productId: item.id, quantity: 1 })
        openCart()
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-16 min-h-screen">
            <div className="flex items-end justify-between mb-8 lg:mb-12 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">{t('Title')}</h1>
                    <p className="text-gray-500 font-medium">{t('Subtitle', { count: items.length })}</p>
                </div>
            </div>

            {/* Bandeau de connexion */}
            {!isAuthenticated && items.length > 0 && (
                <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                    <LogIn className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-grow">
                        <h3 className="font-black text-amber-900 mb-1">Connectez-vous pour sauvegarder votre wishlist</h3>
                        <p className="text-sm text-amber-700 font-medium mb-3">
                            Votre wishlist est actuellement stockée localement. Créez un compte pour la synchroniser sur tous vos appareils.
                        </p>
                        <Link
                            href="/community/login"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Se connecter
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {items.map((item) => (
                    <div key={item.id} className="relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col">
                        {/* Image */}
                        <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden group">
                            <Link href={item.slug} className="absolute inset-0 z-10" />
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    unoptimized
                                />
                            )}
                            {/* Bouton Wishlist flottant */}
                            <div className="absolute top-4 right-4 z-20 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-75">
                                <WishlistButton item={item} className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white" />
                            </div>
                        </div>

                        {/* Contenu */}
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="mb-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.type === 'BOOK' ? 'Livre' : 'Pack'}</p>
                                <h3 className="font-black text-xl leading-snug mb-1 line-clamp-2 hover:text-amber-600 transition-colors">
                                    <Link href={item.slug}>{item.title}</Link>
                                </h3>
                                {item.author && <p className="text-sm text-gray-500 font-bold italic">{item.author}</p>}
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50/50">
                                <span className="font-black text-xl text-gray-900">{item.price} MAD</span>
                                <button
                                    onClick={() => moveToCart(item)}
                                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-lg hover:shadow-amber-500/30 active:scale-90 group/btn"
                                    title={t('AddToCart')}
                                >
                                    <ShoppingBag className="w-5 h-5 transition-transform group-hover/btn:-rotate-12" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
