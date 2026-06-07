'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { updatePack, type PackInput } from '@/lib/actions/packs'
import PackCreativeModal from '@/components/admin/PackCreativeModal'
import ImageInput from '@/components/admin/ImageInput'

interface Product {
    id: string
    title: string
    author: string
    price: number
    image?: string
    category?: string | null
    active: boolean
    stock: number
}

interface PackEditFormProps {
    pack: {
        id: string
        name: string
        description: string
        price: number
        image: string
        isFreeDelivery: boolean
        shippingFees: number
        selectedBookIds: string[]
    }
    products: Product[]
    whatsappPhone?: string
}

export default function PackEditForm({ pack, products, whatsappPhone }: PackEditFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [creativeFormat, setCreativeFormat] = useState<'post' | 'story' | null>(null)
    const [selectedBooks, setSelectedBooks] = useState<string[]>(pack.selectedBookIds)
    const [isFreeDelivery, setIsFreeDelivery] = useState(pack.isFreeDelivery)
    const [shippingFees, setShippingFees] = useState(pack.shippingFees || 30)
    const [searchQuery, setSearchQuery] = useState('')
    const [name, setName] = useState(pack.name)
    const [description, setDescription] = useState(pack.description)
    const [onlyAvailable, setOnlyAvailable] = useState(true)

    function toggleBook(productId: string) {
        setSelectedBooks(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    function toggleAll() {
        if (selectedBooks.length === products.length) {
            setSelectedBooks([])
        } else {
            setSelectedBooks(products.map(b => b.id))
        }
    }

    function toggleAllInCategory(categoryBooks: Product[]) {
        const categoryBookIds = categoryBooks.map(b => b.id)
        const allSelected = categoryBookIds.every(id => selectedBooks.includes(id))
        
        if (allSelected) {
            setSelectedBooks(prev => prev.filter(id => !categoryBookIds.includes(id)))
        } else {
            setSelectedBooks(prev => Array.from(new Set([...prev, ...categoryBookIds])))
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (selectedBooks.length === 0) {
            setError('Veuillez sélectionner au moins un livre')
            setLoading(false)
            return
        }

        const formData = new FormData(e.currentTarget)

        const input: PackInput = {
            name: formData.get('name') as string,
            description: formData.get('description') as string || undefined,
            price: parseFloat(formData.get('price') as string),
            image: formData.get('image') as string || undefined,
            isFreeDelivery,
            shippingFees: isFreeDelivery ? 0 : shippingFees,
            bookIds: selectedBooks,
        }

        const result = await updatePack(pack.id, input)

        if (result.success) {
            router.push('/admin/packs')
            router.refresh()
        } else {
            setError(result.error)
            setLoading(false)
        }
    }

    const selectedBooksData = products.filter(b => selectedBooks.includes(b.id))
    const totalOriginalPrice = selectedBooksData.reduce((sum, b) => sum + b.price, 0)

    // Filter and group products
    const filteredBooks = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             product.author.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesAvailability = onlyAvailable ? (product.active && product.stock > 0) : true
        return matchesSearch && matchesAvailability
    })

    const groupedBooks = filteredBooks.reduce((acc, product) => {
        const category = product.category || 'Non catégorisé'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(product)
        return acc
    }, {} as Record<string, typeof products>)

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/packs"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Modifier le pack</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Modifiez les informations du pack "{pack.name}"
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Pack Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pack Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du Pack</h2>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom du pack <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ex: Pack Développement Personnel"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Description du pack..."
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Prix du pack (MAD) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    defaultValue={pack.price}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="450"
                                />
                                {selectedBooks.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Prix total des livres sélectionnés: <span className="font-medium">{totalOriginalPrice} MAD</span>
                                    </p>
                                )}
                            </div>

                            {/* Image */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Image du pack
                                </label>
                                <ImageInput 
                                    defaultValue={pack.image} 
                                    bookTitle={pack.name} 
                                />
                            </div>

                            {/* Livraison */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isFreeDelivery"
                                            checked={isFreeDelivery}
                                            onChange={(e) => setIsFreeDelivery(e.target.checked)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isFreeDelivery" className="text-sm font-bold text-gray-700 cursor-pointer">
                                            Livraison gratuite
                                        </label>
                                    </div>

                                    {isFreeDelivery ? (
                                        <div className="flex items-center gap-3 px-2 py-1 select-none">
                                            <span className="text-4xl filter drop-shadow-lg">🚚</span>
                                            <div className="flex flex-col">
                                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Livraison</p>
                                                <p className="text-xs font-black text-green-500 leading-none">GRATUITE</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <label htmlFor="shippingFees" className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                Frais de livraison
                                            </label>
                                            <select
                                                id="shippingFees"
                                                value={shippingFees}
                                                onChange={(e) => setShippingFees(Number(e.target.value))}
                                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                                            >
                                                {[20, 30, 35, 40, 45].map((fee) => (
                                                    <option key={fee} value={fee}>
                                                        {fee} MAD
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Sélectionner les livres ({selectedBooks.length} sélectionné{selectedBooks.length > 1 ? 's' : ''})
                                </h2>
                                <div className="flex items-center gap-4 mt-1">
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {selectedBooks.length === products.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                    </button>
                                    <label className="flex items-center gap-2 cursor-pointer group ml-4">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={onlyAvailable}
                                                onChange={(e) => setOnlyAvailable(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-green-600 transition-colors">Disponible</span>
                                    </label>
                                </div>
                            </div>
                            <div className="w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Rechercher par titre ou auteur..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(groupedBooks).length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucun livre trouvé</p>
                            ) : (
                                Object.entries(groupedBooks).map(([category, categoryBooks]) => (
                                    <div key={category} className="mb-6 last:mb-0">
                                        <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                {category} ({categoryBooks.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => toggleAllInCategory(categoryBooks)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {categoryBooks.every(b => selectedBooks.includes(b.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categoryBooks.map((product) => (
                                                <label
                                                    key={product.id}
                                                    className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedBooks.includes(product.id)
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBooks.includes(product.id)}
                                                        onChange={() => toggleBook(product.id)}
                                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500"
                                                    />
                                                    <div className="ml-4 flex-1">
                                                        <p className="text-sm font-black text-gray-900 leading-tight">
                                                            {product.title}
                                                            {!product.active && (
                                                                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded">Inactif</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                            {product.author}
                                                            <span className={`ml-3 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                Stock: {product.stock}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-black text-black ml-2">{product.price} MAD</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Livres sélectionnés:</span>
                                <span className="font-medium">{selectedBooks.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Prix total livres:</span>
                                <span className="font-medium">{totalOriginalPrice} MAD</span>
                            </div>
                        </div>

                        {selectedBooksData.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">Livres inclus:</p>
                                <ul className="space-y-1">
                                    {selectedBooksData.map((product) => (
                                        <li key={product.id} className="text-xs text-gray-600">
                                            • {product.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading || selectedBooks.length === 0}
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreativeFormat('post')}
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                ✨ Générer Post (FB/Insta)
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreativeFormat('story')}
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                            >
                                ✨ Générer Story (FB/Insta)
                            </button>
                            <Link
                                href="/admin/packs"
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </Link>
                        </div>
                    </div>
                </div>
            </form>

            <PackCreativeModal
                isOpen={creativeFormat !== null}
                onClose={() => setCreativeFormat(null)}
                format={creativeFormat || 'post'}
                pack={{
                    id: pack.id,
                    name: name,
                    description: description,
                    price: pack.price,
                    isFreeDelivery: isFreeDelivery,
                    products: selectedBooksData,
                    whatsappNumber: whatsappPhone
                }}
            />
        </div>
    )
}
