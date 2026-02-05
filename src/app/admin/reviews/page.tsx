import { prisma } from '@/lib/prisma'
import { Star, CheckCircle2, Trash2, MessageSquare, BookOpen } from 'lucide-react'
import { approveReview, deleteReview } from '@/lib/actions/reviews'
import { revalidatePath } from 'next/cache'

async function getReviews() {
    return prisma.review.findMany({
        include: { book: true },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function AdminReviewsPage() {
    const reviews = await getReviews()

    const handleApprove = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await approveReview(id)
    }

    const handleDelete = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteReview(id)
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                    Modération des Avis
                </h1>
                <p className="mt-2 text-sm text-gray-500 font-medium italic">
                    Gérez les témoignages clients pour maintenir la qualité de Riwaya.
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100 italic">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">Lecteur</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">Livre</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">Commentaire</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reviews.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                                    Aucun avis à modérer pour le moment.
                                </td>
                            </tr>
                        ) : (
                            reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-black text-gray-900">{review.fullName}</div>
                                        <div className="flex gap-0.5 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm font-bold text-gray-600 truncate max-w-[150px]">{review.book.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 font-medium italic line-clamp-2 max-w-xs leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {review.isApproved ? (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full">Approuvé</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-full">En attente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            {!review.isApproved && (
                                                <form action={handleApprove}>
                                                    <input type="hidden" name="id" value={review.id} />
                                                    <button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                </form>
                                            )}
                                            <form action={handleDelete}>
                                                <input type="hidden" name="id" value={review.id} />
                                                <button className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
