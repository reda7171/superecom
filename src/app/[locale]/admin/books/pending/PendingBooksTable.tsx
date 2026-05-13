'use client'

import { useState } from 'react'
import { Check, X, Search, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { approveBook, rejectBook } from '@/lib/actions/books'
import { useUIStore } from '@/store/ui'

type PendingBook = {
    id: string
    title: string
    author: string
    image: string
    price: number
    createdAt: Date
    seller?: {
        fullName: string | null
        email: string
    } | null
}

export default function PendingBooksTable({ books }: { books: PendingBook[] }) {
    const router = useRouter()
    const { showNotification } = useUIStore()
    const [loading, setLoading] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredBooks = books.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.seller?.fullName && b.seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleApprove = async (id: string, title: string) => {
        if (!confirm(`T'es sur que tu veux approuver ce livre: "${title}" ?`)) return
        setLoading(id)
        
        try {
            const result = await approveBook(id)
            if (result.success) {
                showNotification(`Le livre "${title}" a été approuvé.`, 'success')
            } else {
                showNotification(result.error || 'Erreur lors de l\'approbation.', 'error')
            }
        } catch (e: any) {
            showNotification('Erreur réseau.', 'error')
        } finally {
            setLoading(null)
        }
    }

    const handleReject = async (id: string, title: string) => {
        if (!confirm(`T'es sur que tu veux rejeter ce livre: "${title}" ?`)) return
        setLoading(id)
        
        try {
            const result = await rejectBook(id)
            if (result.success) {
                showNotification(`Le livre "${title}" a été rejeté.`, 'info')
            } else {
                showNotification(result.error || 'Erreur lors du rejet.', 'error')
            }
        } catch (e: any) {
            showNotification('Erreur réseau.', 'error')
        } finally {
            setLoading(null)
        }
    }

    if (books.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Aucun livre en attente</h3>
                <p className="mt-2 text-gray-500 text-center max-w-sm">
                    Tous les livres soumis par les vendeurs ont été traités.
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un livre ou vendeur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Livre</th>
                            <th className="px-6 py-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Vendeur</th>
                            <th className="px-6 py-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Prix</th>
                            <th className="px-6 py-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredBooks.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden shrink-0 flex-col flex items-center justify-center">
                                            {book.image ? (
                                                <Image src={book.image} alt={book.title} width={48} height={64} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 line-clamp-1">{book.title}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{book.author}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {book.seller ? (
                                        <div>
                                            <div className="font-medium text-gray-900">{book.seller.fullName || 'Vendeur Anonyme'}</div>
                                            <div className="text-xs text-gray-500">{book.seller.email}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Inconnu</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{book.price.toFixed(2)} MAD</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">
                                        {new Date(book.createdAt).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleApprove(book.id, book.title)}
                                            disabled={loading === book.id}
                                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                            title="Approuver"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(book.id, book.title)}
                                            disabled={loading === book.id}
                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                            title="Rejeter"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
