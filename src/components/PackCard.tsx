'use client'

import { Link } from '@/i18n/routing'
import { Package, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui'
import WishlistButton from '@/components/WishlistButton'
import { normalizeImage } from '@/lib/utils'

interface PackCardProps {
    id: string
    name: string
    description?: string | null
    price: number
    image: string | null
    shippingFees?: number
    products: Array<{
        product: {
            id: string
            title: string
            author: string
            price: number
            image: string
        }
    }>
}

export default function PackCard({
    id,
    name,
    price,
    image,
    products,
    shippingFees,
}: PackCardProps) {
    const t = useTranslations('Packs')
    const tCommon = useTranslations('Common')
    const addItem = useCartStore((state) => state.addItem)
    const { openCart, showNotification } = useUIStore()
    const totalOriginalPrice = products.reduce((sum: number, pb: any) => sum + pb.product.price, 0)
    const savings = totalOriginalPrice - price
    const savingsPercent = Math.round((savings / totalOriginalPrice) * 100)

    return (
        <div className="group relative bg-[#FDFBF7] rounded-[2rem] overflow-hidden border border-gray-100 hover:border-black shadow-sm hover:shadow-2xl transition-all duration-500">
            {/* Savings Badge - Style Pixio */}
            <div className="absolute top-6 right-6 z-10 pointer-events-none">
                <div className="bg-pixio-pink text-black px-4 py-2 rounded-full shadow-lg border border-black/5 rotate-12 group-hover:rotate-0 transition-transform">
                    <p className="text-[9px] rtl:text-xs font-black uppercase tracking-widest rtl:tracking-normal text-center leading-none">{t('Save')}</p>
                    <p className="text-xl font-black leading-none text-center">-{savingsPercent}%</p>
                </div>
            </div>

            {/* Pack Icon Badge */}
            <div className="absolute top-6 left-6 z-10">
                <div className="bg-black text-white p-2.5 rounded-2xl shadow-lg group-hover:-translate-y-1 transition-transform">
                    <Package className="w-5 h-5" />
                </div>
            </div>

            {/* Wishlist Button */}
            <div className="absolute top-20 left-6 z-10">
                <WishlistButton
                    item={{
                        id,
                        title: name,
                        price,
                        image: image || (products && products.length > 0 ? products[0].product.image : '/images/placeholder.jpg'),
                        type: 'PACK',
                        slug: `/packs/${id}`
                    }}
                    className="bg-white text-black rounded-2xl shadow-lg hover:scale-110 transition-transform w-[40px] h-[40px]"
                />
            </div>

            {/* Image Section */}
            <Link href={`/packs/${id}`} className="block">
                <div className="relative h-64 bg-gray-50 overflow-hidden">
                    {image ? (
                        <img
                            src={normalizeImage(image)}
                            alt={`Pack ${name} - SuperEcom Selection`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.png' }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-pixio-yellow/30 p-8">
                            <div className="grid grid-cols-2 gap-3 transform group-hover:scale-105 transition-transform">
                                {products.slice(0, 4).map((pb: any, idx: number) => (
                                    <div key={pb.product.id} className={`relative w-20 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white ${idx % 2 === 0 ? '-rotate-6' : 'rotate-6'}`}>
                                        <img
                                            src={normalizeImage(pb.product.image)}
                                            alt={`${pb.product.title} - Inclus dans le pack ${name}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.png' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-8">
                <Link href={`/packs/${id}`}>
                    <div className="flex flex-col items-center text-center mb-6">
                        <span className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.2em] rtl:tracking-normal text-gray-400 mb-2">{t('Exclusive')}</span>
                        <h3 className="text-2xl font-black text-black tracking-tighter mb-2 group-hover:translate-y-1 transition-transform">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] rtl:text-xs font-black black uppercase tracking-widest rtl:tracking-normal">{products.length} {t('Includes')}</span>
                        </div>
                    </div>
                </Link>

                {/* Price Section - Style Pixio */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-gray-50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between text-[11px] rtl:text-xs font-black uppercase tracking-widest rtl:tracking-normal">
                        <span className="text-gray-400">{t('RegularPrice')}</span>
                        <span className="text-gray-300 line-through">{totalOriginalPrice} MAD</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[11px] rtl:text-xs font-black uppercase tracking-widest rtl:tracking-normal text-black">{t('PackPrice')}</span>
                        <span className="text-3xl font-black text-black tracking-tighter">
                            {price} <span className="text-[10px] rtl:text-xs font-black text-gray-400 uppercase tracking-widest rtl:tracking-normal">MAD</span>
                        </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        className="w-full flex items-center justify-center gap-3 bg-black text-white font-black text-xs rtl:text-sm uppercase tracking-[0.2em] rtl:tracking-normal py-5 px-6 rounded-full hover:bg-gray-800 active:scale-95 transition-all shadow-xl hover:shadow-black/20 group/btn"
                        onClick={(e) => {
                            e.preventDefault()
                            try {
                                addItem({
                                    type: 'PACK',
                                    id,
                                    title: name,
                                    price,
                                    image: image || (products.length > 0 ? products[0].product.image : '/images/placeholder-pack.jpg'),
                                    booksCount: products.length,
                                    shippingFees,
                                })
                                openCart()
                                showNotification(tCommon('AddedToCartSuccess'), 'success')
                            } catch (error) {
                                console.error('Failed to add pack to cart:', error)
                                showNotification(tCommon('AddedToCartError'), 'error')
                            }
                        }}
                    >
                        <span>{t('AddSelection')}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    )
}
