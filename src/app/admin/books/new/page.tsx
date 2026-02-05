'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createBook, type BookInput } from '@/lib/actions/books'

export default function BookForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        const input: BookInput = {
            title: formData.get('title') as string,
            author: formData.get('author') as string,
            description: formData.get('description') as string,
            isbn: formData.get('isbn') as string || undefined,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            image: formData.get('image') as string,
            category: formData.get('category') as string || undefined,
        }

        const result = await createBook(input)

        if (result.success) {
            router.push('/admin/books')
            router.refresh()
        } else {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/books"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Ajouter un livre</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Remplissez les informations du nouveau livre
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titre */}
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Titre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Atomic Habits"
                        />
                    </div>

                    {/* Auteur */}
                    <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                            Auteur <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="author"
                            name="author"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: James Clear"
                        />
                    </div>

                    {/* ISBN */}
                    <div>
                        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                            ISBN
                        </label>
                        <input
                            type="text"
                            id="isbn"
                            name="isbn"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 9780735211292"
                        />
                    </div>

                    {/* Prix */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Prix (MAD) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="150"
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                            Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="50"
                        />
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Catégorie
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Sélectionner une catégorie</option>
                            <option value="Développement personnel">Développement personnel</option>
                            <option value="Business">Business</option>
                            <option value="Productivité">Productivité</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Finance">Finance</option>
                            <option value="Psychologie">Psychologie</option>
                            <option value="Histoire">Histoire</option>
                            <option value="Stratégie">Stratégie</option>
                        </select>
                    </div>

                    {/* Image URL */}
                    <div className="md:col-span-2">
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                            URL de l'image <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg ou /images/books/book.jpg"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            URL complète ou chemin relatif (ex: /images/books/atomic-habits.jpg)
                        </p>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Description détaillée du livre..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-4">
                    <Link
                        href="/admin/books"
                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    )
}
