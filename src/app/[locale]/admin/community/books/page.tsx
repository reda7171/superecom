import { redirect } from 'next/navigation'
import { getAllBooks } from '@/lib/actions/admin-community'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DeleteBookButton from '@/components/admin/DeleteBookButton'

export default async function AdminBooksPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string; page?: string }>
}) {
    const params = await searchParams
    const status = params.status || 'ALL'
    const page = parseInt(params.page || '1')

    const data = await getAllBooks({ status, page })

    if (!data) {
        redirect('/admin')
    }

    const statusOptions = [
        { value: 'ALL', label: 'Tous' },
        { value: 'AVAILABLE', label: 'Disponibles' },
        { value: 'PENDING', label: 'En attente' },
        { value: 'EXCHANGED', label: 'Échangés' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/community" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-black">Gestion des livres</h1>
                        <p className="text-sm text-gray-500 font-bold">{data.total} livres au total</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-700">Statut :</label>
                    <div className="flex gap-2">
                        {statusOptions.map((option) => (
                            <Link
                                key={option.value}
                                href={`/admin/community/books?status=${option.value}`}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${status === option.value
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {option.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.books.map((book) => (
                    <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow">
                        {/* Image */}
                        <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                            {book.image ? (
                                <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <span className="text-4xl">📚</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-black ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                        book.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {book.status}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-black text-sm text-black mb-1 line-clamp-2">{book.title}</h3>
                            <p className="text-xs text-gray-500 mb-2">{book.author}</p>

                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-black ${book.condition === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                        book.condition === 'GOOD' ? 'bg-green-100 text-green-700' :
                                            'bg-orange-100 text-orange-700'
                                    }`}>
                                    {book.condition}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-2">Propriétaire :</p>
                                <p className="text-xs font-bold text-black">{book.owner.fullName}</p>
                                <p className="text-xs text-gray-500">{book.owner.email}</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <DeleteBookButton bookId={book.id} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Page {data.currentPage} sur {data.pages}
                    </p>
                    <div className="flex gap-2">
                        {data.currentPage > 1 && (
                            <Link
                                href={`/admin/community/books?status=${status}&page=${data.currentPage - 1}`}
                                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200"
                            >
                                Précédent
                            </Link>
                        )}
                        {data.currentPage < data.pages && (
                            <Link
                                href={`/admin/community/books?status=${status}&page=${data.currentPage + 1}`}
                                className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800"
                            >
                                Suivant
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
