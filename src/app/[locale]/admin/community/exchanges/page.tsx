import { redirect } from 'next/navigation'
import { getAllExchanges, deleteExchange } from '@/lib/actions/admin-community'
import { ArrowLeft, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import DeleteExchangeButton from '@/components/admin/DeleteExchangeButton'

export default async function AdminExchangesPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string; page?: string }>
}) {
    const params = await searchParams
    const status = params.status || 'ALL'
    const page = parseInt(params.page || '1')

    const data = await getAllExchanges({ status, page })

    if (!data) {
        redirect('/admin')
    }

    const statusOptions = [
        { value: 'ALL', label: 'Tous' },
        { value: 'PENDING', label: 'En attente' },
        { value: 'ACCEPTED', label: 'Acceptés' },
        { value: 'REJECTED', label: 'Refusés' },
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
                        <h1 className="text-3xl font-black text-black">Gestion des échanges</h1>
                        <p className="text-sm text-gray-500 font-bold">{data.total} échanges au total</p>
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
                                href={`/admin/community/exchanges?status=${option.value}`}
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

            {/* Exchanges List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Demandeur</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Livre demandé</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Propriétaire</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.exchanges.map((exchange) => (
                                <tr key={exchange.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {exchange.requester.image && (
                                                <img src={exchange.requester.image} alt="" className="w-8 h-8 rounded-full" />
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-black">{exchange.requester.fullName}</p>
                                                <p className="text-xs text-gray-500">{exchange.requester.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {exchange.bookRequested.image && (
                                                <img src={exchange.bookRequested.image} alt="" className="w-10 h-14 rounded object-cover" />
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-black">{exchange.bookRequested.title}</p>
                                                <p className="text-xs text-gray-500">{exchange.bookRequested.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-sm text-black">{exchange.responder.fullName}</p>
                                            <p className="text-xs text-gray-500">{exchange.responder.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${exchange.type === 'DIRECT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {exchange.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${exchange.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                exchange.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {exchange.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">
                                            {new Date(exchange.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <DeleteExchangeButton exchangeId={exchange.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Page {data.currentPage} sur {data.pages}
                        </p>
                        <div className="flex gap-2">
                            {data.currentPage > 1 && (
                                <Link
                                    href={`/admin/community/exchanges?status=${status}&page=${data.currentPage - 1}`}
                                    className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200"
                                >
                                    Précédent
                                </Link>
                            )}
                            {data.currentPage < data.pages && (
                                <Link
                                    href={`/admin/community/exchanges?status=${status}&page=${data.currentPage + 1}`}
                                    className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800"
                                >
                                    Suivant
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
