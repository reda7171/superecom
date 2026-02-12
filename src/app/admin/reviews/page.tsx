import { getAllReviews, getReviewsStats, approveReview, deleteReview } from '@/lib/actions/reviews'
import { Star, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function ReviewsAdminPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>
}) {
    // Protection
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')
    if (!token) redirect('/admin/login')

    const params = await searchParams
    const filter = (params.filter || 'all') as 'all' | 'approved' | 'pending'

    const [reviews, stats] = await Promise.all([
        getAllReviews(filter),
        getReviewsStats(),
    ])

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-black mb-2">Modération des Avis</h1>
                <p className="text-gray-500 font-bold">Gérez les avis clients et modérez le contenu</p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Total</p>
                            <p className="text-3xl font-black text-black">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-2">Approuvés</p>
                            <p className="text-3xl font-black text-green-600">{stats.approved}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">En Attente</p>
                            <p className="text-3xl font-black text-orange-600">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Filtrer :</span>
                    <div className="flex gap-2">
                        <a
                            href="/fr/admin/reviews"
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tous ({stats.total})
                        </a>
                        <a
                            href="/fr/admin/reviews?filter=pending"
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'pending'
                                ? 'bg-orange-600 text-white'
                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                }`}
                        >
                            En Attente ({stats.pending})
                        </a>
                        <a
                            href="/fr/admin/reviews?filter=approved"
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                        >
                            Approuvés ({stats.approved})
                        </a>
                    </div>
                </div>
            </div>

            {/* Liste des avis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {reviews.length === 0 ? (
                    <div className="p-20 text-center">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">Aucun avis à afficher</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-6">
                                    {/* Image du livre */}
                                    <div className="relative w-20 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={review.book.image}
                                            alt={review.book.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Contenu */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-black text-black mb-1">{review.book.title}</h3>
                                                <p className="text-sm text-gray-500 font-bold">{review.fullName}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {review.isApproved ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest rounded-full">
                                                        Approuvé
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-widest rounded-full">
                                                        En Attente
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Note */}
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                            <span className="text-sm font-bold text-gray-600 ml-2">
                                                {review.rating}/5
                                            </span>
                                        </div>

                                        {/* Commentaire */}
                                        <p className="text-gray-700 font-medium mb-4">{review.comment}</p>

                                        {/* Date */}
                                        <p className="text-xs text-gray-400 font-bold mb-4">
                                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {!review.isApproved && (
                                                <form>
                                                    <button
                                                        type="submit"
                                                        formAction={async () => {
                                                            'use server'
                                                            await approveReview(review.id)
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approuver
                                                    </button>
                                                </form>
                                            )}
                                            <form>
                                                <button
                                                    type="submit"
                                                    formAction={async () => {
                                                        'use server'
                                                        await deleteReview(review.id)
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Supprimer
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
