import { getBooks } from '@/lib/db/books'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import BooksTable from './BooksTable'

export default async function BooksPage() {
    const books = await getBooks({ active: undefined }) // Tous les livres (actifs et inactifs)

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Livres</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Gérez votre catalogue de livres
                    </p>
                </div>
                <Link
                    href="/admin/books/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter un livre
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Total Livres</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{books.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Actifs</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {books.filter(b => b.active).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Stock Total</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">
                        {books.reduce((sum, b) => sum + b.stock, 0)}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                    <p className="mt-2 text-3xl font-bold text-purple-600">
                        {books.reduce((sum, b) => sum + (b.price * b.stock), 0).toFixed(0)} MAD
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                <BooksTable books={books} />
            </div>
        </div>
    )
}
