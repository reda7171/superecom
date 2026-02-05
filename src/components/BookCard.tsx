'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'

interface BookCardProps {
    id: string
    title: string
    author: string
    price: number
    image: string
    category?: string | null
    stock: number
    variant?: 'default' | 'compact' | 'featured'
}

export default function BookCard({
    id,
    title,
    author,
    price,
    image,
    category,
    stock,
    variant = 'default',
}: BookCardProps) {
    const isCompact = variant === 'compact'
    const isFeatured = variant === 'featured'
    const addItem = useCartStore((state) => state.addItem)

    return (
        <div className={`group relative bg-white rounded-[2rem] overflow-hidden transition-all duration-500 border border-gray-100/50 hover:border-black shadow-sm hover:shadow-2xl ${isFeatured ? 'scale-105 z-10 border-black shadow-xl' : ''}`}>
            {/* Image Container */}
            <Link href={`/books/${id}`} className="block relative">
                <div className={`relative bg-pixio-cream overflow-hidden ${isCompact ? 'aspect-[3/4]' : isFeatured ? 'aspect-[4/5]' : 'aspect-square'
                    }`}>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        unoptimized
                    />

                    {/* Stock Badge */}
                    {stock <= 5 && stock > 0 && (
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm border border-orange-100">
                                {stock} restants
                            </span>
                        </div>
                    )}

                    {stock === 0 && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                            <span className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Category Label */}
                    {category && !isCompact && (
                        <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                {category}
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className={`text-center flex flex-col items-center ${isCompact ? 'p-4' : 'p-6'}`}>
                <Link href={`/books/${id}`} className="block w-full">
                    <h3 className={`font-black text-black tracking-tighter line-clamp-2 transition-colors ${isCompact ? 'text-sm mb-1 uppercase' : isFeatured ? 'text-xl mb-2' : 'text-base mb-1.5'
                        }`}>
                        {title}
                    </h3>
                    <p className={`text-gray-400 font-bold italic ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                        Par {author}
                    </p>
                </Link>

                {/* Price & Action */}
                <div className="mt-4 flex flex-col items-center gap-4 w-full">
                    <p className={`font-black text-black leading-none ${isCompact ? 'text-base' : isFeatured ? 'text-2xl' : 'text-xl'
                        }`}>
                        {price} <span className="text-[10px] font-black text-gray-400">MAD</span>
                    </p>

                    {stock > 0 && (
                        <button
                            className={`w-full flex items-center justify-center gap-2 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20 group/btn ${isCompact
                                ? 'py-3'
                                : isFeatured
                                    ? 'py-4'
                                    : 'py-3.5'
                                }`}
                            onClick={(e) => {
                                e.preventDefault()
                                addItem({
                                    type: 'BOOK',
                                    id,
                                    title,
                                    price,
                                    image,
                                })
                            }}
                        >
                            <span>Add to Cart</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </button>
                    )}
                </div>
            </div>

            {/* Featured Badge */}
            {isFeatured && (
                <div className="absolute top-6 left-6 -rotate-12">
                    <div className="bg-pixio-yellow text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-black/5 shadow-sm">
                        ✨ Best Seller
                    </div>
                </div>
            )}
        </div>
    )
}
