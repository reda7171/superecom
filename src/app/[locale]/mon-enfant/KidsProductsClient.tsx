'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useCartStore } from '@/store/cart'
import { useTranslations } from 'next-intl'

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    image: string | null
    category: string
}

export default function KidsProductsClient({ products }: { products: Product[] }) {
    const [added, setAdded] = useState<string | null>(null)
    const addItem = useCartStore((s: any) => s.addItem)
    const t = useTranslations('KidsPage.ClientStrings')

    if (products.length === 0) return null

    function handleAdd(product: Product) {
        addItem({
            id: product.id,
            type: 'ACCESSORY',
            name: product.name,
            price: product.price,
            image: product.image ?? '',
            quantity: 1,
        })
        setAdded(product.id)
        setTimeout(() => setAdded(null), 1500)
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
                <div
                    key={product.id}
                    className="bg-white rounded-[2rem] border border-pink-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
                >
                    <Link href={`/mon-enfant/${product.id}`} className="relative h-48 bg-pink-50 w-full overflow-hidden block">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <Package className="w-12 h-12 text-pink-200" />
                            </div>
                        )}
                        {/* Badge stock */}
                        {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black rounded-full shadow-sm">
                                {t('OnlyLeft', { stock: product.stock })}
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[2px]">
                                <span className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">{t('OutOfStock')}</span>
                            </div>
                        )}
                    </Link>

                    <div className="p-5 flex flex-col flex-grow">
                        <Link href={`/mon-enfant/${product.id}`} className="block">
                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-2 line-clamp-2 hover:text-pink-600 transition-colors">{product.name}</h3>
                            {product.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium">{product.description}</p>
                            )}
                        </Link>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className="text-xl font-black text-pink-500">{product.price.toFixed(2)} DH</span>
                            <button
                                onClick={() => handleAdd(product)}
                                disabled={product.stock === 0}
                                className={`p-3 rounded-2xl transition-all font-bold flex items-center gap-2 ${
                                    added === product.id
                                        ? 'bg-green-500 text-white scale-95 shadow-md shadow-green-200'
                                        : product.stock === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95 shadow-md shadow-pink-200'
                                }`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
