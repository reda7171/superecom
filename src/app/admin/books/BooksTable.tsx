'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteBook, toggleBookStatus } from '@/lib/actions/books'

interface Book {
    id: string
    title: string
    author: string
    price: number
    stock: number
    image: string
    category: string | null
    active: boolean
}

export default function BooksTable({ books }: { books: Book[] }) {
    const [loading, setLoading] = useState<string | null>(null)

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
            return
        }

        setLoading(id)
        const result = await deleteBook(id)
        setLoading(null)

        if (!result.success) {
            alert(result.error)
        }
    }

    async function handleToggleStatus(id: string, currentStatus: boolean) {
        setLoading(id)
        const result = await toggleBookStatus(id, !currentStatus)
        setLoading(null)

        if (!result.success) {
            alert(result.error)
        }
    }

    if (books.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Aucun livre trouvé</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Livre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {books.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-12 w-10 flex-shrink-0 relative">
                                        <Image
                                            src={book.image}
                                            alt={book.title}
                                            fill
                                            className="object-cover rounded"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {book.title}
                                        </div>
                                        <div className="text-sm text-gray-500">{book.author}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {book.category || 'Non catégorisé'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {book.price} MAD
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${book.stock > 10 ? 'text-green-600' : book.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                    {book.stock} unités
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleToggleStatus(book.id, book.active)}
                                    disabled={loading === book.id}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        } hover:opacity-80 transition-opacity`}
                                >
                                    {book.active ? (
                                        <>
                                            <Eye className="w-3 h-3 mr-1" />
                                            Actif
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            Inactif
                                        </>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/books/${book.id}/edit`}
                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(book.id, book.title)}
                                        disabled={loading === book.id}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
