'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Search, Star, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Link } from '@/i18n/routing'

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    image: string | null
    category: string
}

export default function FournitureClient({ products }: { products: Product[] }) {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [added, setAdded] = useState<string | null>(null)
    const addItem = useCartStore((s: any) => s.addItem)

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    /* Ajouter au panier */
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

    if (products.length === 0) return null

    return (
        <div>
            {/* Barre recherche & Filtres */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none shadow-sm"
                    />
                </div>

                {/* Filtres Catégories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    {[
                        { id: 'ALL', label: 'Tous' },
                        { id: 'FURNITURE', label: 'Fournitures' },
                        { id: 'BOOKMARK', label: 'Marque-pages' },
                        { id: 'LIBRARY', label: 'Bibliothèques' },
                        { id: 'USB', label: 'Clés USB' },
                        { id: 'ACCESSORY', label: 'Autres' },
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                                selectedCategory === cat.id
                                    ? 'bg-amber-500 text-white shadow-sm scale-95'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grille produits */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map(product => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                    >
                        <Link href={`/fourniture-bureau/${product.id}`} className="flex flex-col flex-grow">
                            {/* Image */}
                            <div className="relative h-44 bg-slate-50 w-full">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Package className="w-12 h-12 text-slate-200" />
                                    </div>
                                )}
                                {/* Badge stock */}
                                {product.stock <= 5 && product.stock > 0 && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full">
                                        Plus que {product.stock}
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Épuisé</span>
                                    </div>
                                )}
                            </div>

                            {/* Infos */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                {product.description && (
                                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{product.description}</p>
                                )}
                            </div>
                        </Link>
                        
                        <div className="p-4 pt-0 mt-auto flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900">{product.price.toFixed(2)} DH</span>
                            <button
                                onClick={() => handleAdd(product)}
                                disabled={product.stock === 0}
                                className={`p-2 rounded-xl transition-all text-sm font-bold flex items-center gap-1.5 ${
                                    added === product.id
                                        ? 'bg-green-500 text-white scale-95'
                                        : product.stock === 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                                }`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                {added === product.id ? 'Ajouté !' : ''}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-400 font-bold">
                    Aucun produit trouvé pour « {search} »
                </div>
            )}
        </div>
    )
}
