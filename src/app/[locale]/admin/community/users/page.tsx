import { redirect } from 'next/navigation'
import { getAllUsers } from '@/lib/actions/admin-community'
import { ArrowLeft, Star, BookOpen, Repeat, Coins } from 'lucide-react'
import Link from 'next/link'

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || '1')

    const data = await getAllUsers(page)

    if (!data) {
        redirect('/admin')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/community" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-black">Gestion des utilisateurs</h1>
                        <p className="text-sm text-gray-500 font-bold">{data.total} utilisateurs au total</p>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.users.map((user) => (
                    <div key={user.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                        {/* User Info */}
                        <div className="flex items-start gap-4 mb-6">
                            {user.image ? (
                                <img src={user.image} alt={user.fullName || ''} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-2xl font-black text-gray-400">
                                        {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-grow min-w-0">
                                <h3 className="font-black text-lg text-black truncate">{user.fullName || 'Sans nom'}</h3>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                {user.city && (
                                    <p className="text-xs text-gray-400 mt-1">📍 {user.city}</p>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs font-bold text-gray-500">Note</span>
                                </div>
                                <p className="text-lg font-black text-black">{user.rating.toFixed(1)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Coins className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-bold text-gray-500">Crédits</span>
                                </div>
                                <p className="text-lg font-black text-black">{user.credits}</p>
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="font-bold">Livres</span>
                                </div>
                                <span className="font-black text-black">{user._count.ownedBooks}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Repeat className="w-4 h-4" />
                                    <span className="font-bold">Échanges envoyés</span>
                                </div>
                                <span className="font-black text-black">{user._count.sentExchanges}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Repeat className="w-4 h-4" />
                                    <span className="font-bold">Échanges reçus</span>
                                </div>
                                <span className="font-black text-black">{user._count.receivedExchanges}</span>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
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
                                href={`/admin/community/users?page=${data.currentPage - 1}`}
                                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200"
                            >
                                Précédent
                            </Link>
                        )}
                        {data.currentPage < data.pages && (
                            <Link
                                href={`/admin/community/users?page=${data.currentPage + 1}`}
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
