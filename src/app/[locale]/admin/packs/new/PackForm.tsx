'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createPack, type PackInput } from '@/lib/actions/packs'

interface Book {
    id: string
    title: string
    author: string
    price: number
}

export default function PackForm({ books }: { books: Book[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedBooks, setSelectedBooks] = useState<string[]>([])

    function toggleBook(bookId: string) {
        setSelectedBooks(prev =>
            prev.includes(bookId)
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        )
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

    const selectedBooksData = books.filter(b => selectedBooks.includes(b.id))
    const totalOriginalPrice = selectedBooksData.reduce((sum, b) => sum + b.price, 0)

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
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de l'image
                                </label>
                                <input
                                    type="url"
                                    id="image"
                                    name="image"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="/images/packs/pack.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Book Selection */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Sélectionner les livres ({selectedBooks.length} sélectionné{selectedBooks.length > 1 ? 's' : ''})
                        </h2>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {books.map((book) => (
                                <label
                                    key={book.id}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedBooks.includes(book.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedBooks.includes(book.id)}
                                        onChange={() => toggleBook(book.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">{book.title}</p>
                                        <p className="text-xs text-gray-500">{book.author}</p>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{book.price} MAD</span>
                                </label>
                            ))}
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
                                    {selectedBooksData.map((book) => (
                                        <li key={book.id} className="text-xs text-gray-600">
                                            • {book.title}
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
                                {loading ? 'Création...' : 'Créer le pack'}
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
        </div>
    )
}
