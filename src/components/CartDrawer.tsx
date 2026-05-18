'use client'

import { useCartStore } from '@/store/cart'
import { normalizeImage } from '@/lib/utils'
// import Link from 'next/link' <-- remove standard next link
import { X, Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCartStore()
    const [mounted, setMounted] = useState(false)
    const t = useTranslations('Cart');

    // Éviter les problèmes d'hydratation avec localStorage
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const totalPrice = getTotalPrice()
    const totalItems = getTotalItems()
    
    // Si tous les articles sont numériques, pas de frais de livraison
    // Si un article (ex: pack) a les frais de livraison gratuits, tout le panier est gratuit
    const hasOnlyDigital = items.length > 0 && items.every(item => item.type === 'DIGITAL')
    const hasFreeShippingItem = items.some(item => item.shippingFees === 0)
    const shippingFee = (hasOnlyDigital || hasFreeShippingItem || totalPrice >= 500) ? 0 : 30
    const finalTotal = totalPrice + shippingFee

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 rtl:left-0 rtl:right-auto h-full w-full sm:w-[520px] bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header - Style Pixio */}
                    <div className="flex items-center justify-between p-8 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight">{t('Title')}</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    {t('SelectedItems', { count: totalItems })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-black" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-pixio-cream/30">
                        {items.length === 0 ? (
                            // Empty State - Style Pixio
                            <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-8">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10">
                                        <ShoppingCart className="w-12 h-12 text-gray-200" />
                                    </div>
                                    <div className="absolute inset-0 bg-pixio-pink rounded-full blur-2xl opacity-20 scale-150"></div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-black tracking-tight">{t('EmptyTitle')}</h3>
                                    <p
                                        className="text-gray-500 font-medium"
                                        dangerouslySetInnerHTML={{ __html: t.raw('EmptyDesc') }}
                                    />
                                </div>
                                <Link
                                    href="/books"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20"
                                >
                                    <span>{t('DiscoverBooks')}</span>
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>
                            </div>
                        ) : (
                            // Cart Items - Styled Cards
                            <div className="p-8 space-y-6">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:border-black group/item"
                                    >
                                        {/* Image */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-pixio-cream rounded-2xl overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform">
                                            {item.image && typeof item.image === 'string' && item.image.trim().length > 5 ? (
                                                <img
                                                    src={normalizeImage(item.image)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/book-placeholder.png' }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                    <ShoppingCart className="w-8 h-8" />
                                                </div>
                                            )}
                                            {item.type === 'PACK' && (
                                                <div className="absolute top-2 left-2">
                                                    <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                                                        {t('Set')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-black text-black tracking-tight line-clamp-2 leading-none group-hover:underline">
                                                        {item.title}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1 text-gray-300 hover:text-black transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <p className="text-sm font-black text-black">
                                                        {item.price} <span className="text-[10px] text-gray-500">MAD</span>
                                                    </p>
                                                    {item.booksCount && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full">
                                                            {item.booksCount} {t('Titles')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity Controls - Style Pixio */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center p-1 bg-pixio-cream rounded-full border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-10 text-center text-xs font-black text-black">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-black hover:text-white transition-all"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {items.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="w-full py-4 text-[10px] text-gray-400 hover:text-black font-black uppercase tracking-[0.2em] transition-colors"
                                    >
                                        {t('ClearSelection')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer - Style Pixio Summary */}
                    {items.length > 0 && (
                        <div className="p-8 bg-white border-t border-gray-50 space-y-8">
                            {/* Summary */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">{t('Subtotal')}</span>
                                    <span className="text-black">{totalPrice} MAD</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">{t('Delivery')}</span>
                                    {shippingFee === 0 ? (
                                        <span className="text-pixio-pink bg-black px-2 py-1 rounded-md">{t('Complimentary')}</span>
                                    ) : (
                                        <span className="text-black">{shippingFee} MAD</span>
                                    )}
                                </div>

                                {totalPrice < 500 && (
                                    <div className="p-4 bg-pixio-yellow rounded-2xl border border-black/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/60">
                                            {t('FreeShippingAd', { amount: 500 - totalPrice })}
                                        </p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-black">{t('OrderTotal')}</span>
                                    <span className="text-3xl font-black text-black tracking-tighter">{finalTotal} MAD</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <div className="space-y-4">
                                <Link
                                    href="/checkout"
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-3 w-full py-6 bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-full hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20"
                                >
                                    <span>{t('ProceedToCheckout')}</span>
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>

                                <button
                                    onClick={onClose}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                >
                                    {t('KeepExploring')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
