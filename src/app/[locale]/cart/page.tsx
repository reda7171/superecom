'use client'

import { useCartStore } from '@/store/cart'
import Header from '@/components/HeaderWithUser'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Minus, Plus, Trash2, ShoppingCart, Shield, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import Footer from '@/components/Footer'

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCartStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const totalPrice = getTotalPrice()
    const totalItems = getTotalItems()
    const shippingFee = totalPrice >= 500 ? 0 : 30
    const finalTotal = totalPrice + shippingFee

    return (
        <div className="min-h-screen bg-pixio-cream text-black">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40">
                <div className="flex items-center justify-between mb-16 px-4">
                    <h1 className="text-6xl font-black tracking-tighter flex items-center gap-6">
                        Archive<span className="text-gray-200">.</span>
                    </h1>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                        {totalItems} Collections
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-32 text-center shadow-2xl shadow-black/5 border border-gray-100">
                        <div className="w-32 h-32 bg-pixio-cream rounded-full flex items-center justify-center mx-auto mb-10 transition-transform hover:scale-110">
                            <ShoppingCart className="w-12 h-12 text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-black mb-6 tracking-tighter">Your archive is empty<span className="text-gray-200">.</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-16 max-w-sm mx-auto leading-loose">
                            It seems you haven't curated any volumes yet.
                            Explore our selects to start your collection.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/books"
                                className="px-12 py-6 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-800 transition-all shadow-xl"
                            >
                                Browse Library
                            </Link>
                            <Link
                                href="/packs"
                                className="px-12 py-6 bg-white text-black border-2 border-black/5 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:border-black transition-all"
                            >
                                View Bundles
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-8">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col sm:flex-row gap-10 group"
                                >
                                    {/* Image */}
                                    <div className="relative w-full sm:w-32 h-44 flex-shrink-0 bg-pixio-cream rounded-[2rem] overflow-hidden border border-gray-50 transition-transform group-hover:scale-105">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {item.type === 'PACK' && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                                                    BUNDLE
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <div className="flex justify-between items-start gap-6 mb-4">
                                                <h3 className="text-xl font-black tracking-tighter uppercase leading-tight group-hover:text-gray-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xl font-black tracking-tighter whitespace-nowrap">
                                                    {item.price * item.quantity} MAD
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 mb-8">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-pixio-cream px-4 py-2 rounded-xl text-black">
                                                    {item.price} MAD / item
                                                </span>
                                                {item.booksCount && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                                                        {item.booksCount} volumes included
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 bg-pixio-cream p-2 rounded-2xl">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 text-center text-xs font-black uppercase tracking-widest">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="flex items-center gap-2 text-gray-300 hover:text-red-500 text-[10px] font-black uppercase tracking-widest px-6 py-3 transition-colors rounded-full hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Delete item</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-start pt-10">
                                <button
                                    onClick={clearCart}
                                    className="text-gray-200 hover:text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 px-10 py-5 transition-all rounded-full hover:bg-white"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear all selects
                                </button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-gray-50 sticky top-32">
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-10 pb-6 border-b border-gray-50">
                                    Archive Summary
                                </h2>

                                <div className="space-y-6 mb-12">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Items ({totalItems})</span>
                                        <span className="text-xs font-black uppercase tracking-widest">{totalPrice} MAD</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping</span>
                                        {shippingFee === 0 ? (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-black px-4 py-2 rounded-full shadow-lg">
                                                Free Ship
                                            </span>
                                        ) : (
                                            <span className="text-xs font-black uppercase tracking-widest">{shippingFee} MAD</span>
                                        )}
                                    </div>

                                    {totalPrice < 500 && (
                                        <div className="bg-pixio-cream/50 p-8 rounded-[2rem] border border-gray-50">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-6 leading-relaxed">
                                                Only <span className="text-black">{500 - totalPrice} MAD</span> more for <span className="text-black">FREE WORLDWIDE SHIP</span>.
                                            </p>
                                            <div className="w-full bg-white h-2 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="bg-black h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${(totalPrice / 500) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-50 pt-8 mb-12">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-xs font-black uppercase tracking-[0.3em]">Total Value</span>
                                        <span className="text-5xl font-black tracking-tighter">{finalTotal} MAD</span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-200 text-right">Taxes dynamic calculated</p>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full h-24 flex items-center justify-center gap-6 bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20 group active:scale-95 mb-10"
                                >
                                    <span>Begin Checkout</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </Link>

                                <Link
                                    href="/books"
                                    className="w-full text-center block text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors"
                                >
                                    Continue curating
                                </Link>

                                <div className="mt-16 flex items-center justify-center gap-8 text-gray-200">
                                    <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.2em]">
                                        <Shield className="w-4 h-4" />
                                        Secure
                                    </div>
                                    <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.2em]">
                                        <Truck className="w-4 h-4" />
                                        Fast Ship
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
