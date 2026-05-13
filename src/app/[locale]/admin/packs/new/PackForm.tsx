'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createPack, type PackInput } from '@/lib/actions/packs'
import dynamic from 'next/dynamic'
import ImageInput from '@/components/admin/ImageInput'

const PackCreativeModal = dynamic(() => import('@/components/admin/PackCreativeModal'), {
    ssr: false,
})

interface Book {
    id: string
    title: string
    author: string
    price: number
    image?: string
    category?: string | null
    active: boolean
}

export default function PackForm({ books, whatsappPhone }: { books: Book[], whatsappPhone?: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedBooks, setSelectedBooks] = useState<string[]>([])
    const [showCreativeModal, setShowCreativeModal] = useState(false)
    const [packPreviewData, setPackPreviewData] = useState<any>(null)
    const [isFreeDelivery, setIsFreeDelivery] = useState(false)
    const [shippingFees, setShippingFees] = useState(30)
    const [searchQuery, setSearchQuery] = useState('')

    function toggleBook(bookId: string) {
        setSelectedBooks(prev =>
            prev.includes(bookId)
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        )
    }

    function toggleAll() {
        if (selectedBooks.length === books.length) {
            setSelectedBooks([])
        } else {
            setSelectedBooks(books.map(b => b.id))
        }
    }

    function selectRandomFour() {
        const shuffled = [...books].sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, 4).map(b => b.id)
        setSelectedBooks(selected)
    }

    function toggleAllInCategory(categoryBooks: Book[]) {
        const categoryBookIds = categoryBooks.map(b => b.id)
        const allSelected = categoryBookIds.every(id => selectedBooks.includes(id))
        
        if (allSelected) {
            setSelectedBooks(prev => prev.filter(id => !categoryBookIds.includes(id)))
        } else {
            setSelectedBooks(prev => Array.from(new Set([...prev, ...categoryBookIds])))
        }
    }

    const selectedBooksData = books.filter(b => selectedBooks.includes(b.id))
    const totalOriginalPrice = selectedBooksData.reduce((sum, b) => sum + b.price, 0)

    // Filter and group books
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const groupedBooks = filteredBooks.reduce((acc, book) => {
        const category = book.category || 'Non catégorisé'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(book)
        return acc
    }, {} as Record<string, typeof books>)

    const handleOpenCreative = () => {
        const name = (document.getElementById('name') as HTMLInputElement)?.value || 'Nouveau Pack';
        const description = (document.getElementById('description') as HTMLTextAreaElement)?.value || '';
        const priceStr = (document.getElementById('price') as HTMLInputElement)?.value;
        const price = priceStr ? parseFloat(priceStr) : totalOriginalPrice;

        setPackPreviewData({
            name,
            description,
            price,
            isFreeDelivery,
            books: selectedBooksData,
            whatsappNumber: whatsappPhone
        });
        setShowCreativeModal(true);
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

        const result = await createPack(input)

        if (result.success) {
            router.push('/admin/packs')
            router.refresh()
        } else {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Modal de génération d'image */}
            <PackCreativeModal 
                isOpen={showCreativeModal}
                onClose={() => setShowCreativeModal(false)}
                pack={packPreviewData}
            />

            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/packs"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Créer un pack</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Créez une offre groupée de livres
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
                                    defaultValue="" 
                                    bookTitle="Nouveau Pack" 
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
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500"
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

                    {/* Book Selection */}
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
                                        {selectedBooks.length === books.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={selectRandomFour}
                                        className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-all active:scale-95 border border-orange-100"
                                    >
                                        🎲 4 au hasard
                                    </button>
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
                                            {categoryBooks.map((book) => (
                                                <label
                                                    key={book.id}
                                                    className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedBooks.includes(book.id)
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBooks.includes(book.id)}
                                                        onChange={() => toggleBook(book.id)}
                                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500"
                                                    />
                                                    <div className="ml-4 flex-1">
                                                        <p className="text-sm font-black text-gray-900 leading-tight">
                                                            {book.title}
                                                            {!book.active && (
                                                                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded">Inactif</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{book.author}</p>
                                                    </div>
                                                    <span className="text-sm font-black text-black ml-2">{book.price} MAD</span>
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
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 sticky top-6 shadow-sm">
                        <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tighter">Résumé</h2>

                        <div className="space-y-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Livres sélectionnés</span>
                                <span className="font-black text-black">{selectedBooks.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Prix cumulé</span>
                                <span className="font-black text-black">{totalOriginalPrice} MAD</span>
                            </div>
                        </div>

                        {selectedBooksData.length > 0 && (
                            <div className="mb-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Livres inclus</p>
                                <ul className="space-y-3">
                                    {selectedBooksData.map((book) => (
                                        <li key={book.id} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                            <p className="text-xs font-bold text-gray-800 line-clamp-1">{book.title}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            {selectedBooks.length > 0 && (
                                <button
                                    type="button"
                                    className="w-full inline-flex items-center justify-center p-4 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 mb-4 group"
                                    onClick={handleOpenCreative}
                                >
                                    <span className="mr-3">✨</span>
                                    Générer image marketing
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading || selectedBooks.length === 0}
                                className="w-full inline-flex items-center justify-center p-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                            >
                                <Save className="w-5 h-5 mr-3" />
                                {loading ? 'Création...' : 'Créer le pack'}
                            </button>
                            <Link
                                href="/admin/packs"
                                className="w-full inline-flex items-center justify-center p-4 border-2 border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50 hover:text-gray-600 transition-all text-center mt-2"
                            >
                                Annuler
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
