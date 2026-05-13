import { getAllReviews, getReviewsStats, approveReview, deleteReview } from '@/lib/actions/reviews'
import { Star, CheckCircle, XCircle, Clock, Trash2, MessageSquare, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminReviewsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ filter?: string }>
}) {
    const { locale } = await params
    const searchParamsValues = await searchParams
    const filter = (searchParamsValues.filter || 'all') as 'all' | 'approved' | 'pending'

    const [reviews, stats] = await Promise.all([
        getAllReviews(filter),
        getReviewsStats(),
    ])

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Avis Clients<span className="text-yellow-500">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Modération & Gestion de la réputation narrative
                    </p>
                </div>
                
                {/* Filtres Rapides Premium */}
                <div className="flex bg-gray-100 p-1.5 rounded-[2rem] shadow-inner w-fit">
                    {[
                        { label: 'Tous', filter: 'all', count: stats.total },
                        { label: 'En Attente', filter: 'pending', count: stats.pending },
                        { label: 'Approuvés', filter: 'approved', count: stats.approved }
                    ].map((item) => (
                        <Link
                            key={item.filter}
                            href={`/${locale}/admin/reviews${item.filter === 'all' ? '' : `?filter=${item.filter}`}`}
                            className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === item.filter
                                ? 'bg-white text-black shadow-md'
                                : 'text-gray-500 hover:text-black'
                                }`}
                        >
                            {item.label} ({item.count})
                        </Link>
                    ))}
                </div>
            </div>

            {/* Statistiques en Cartes Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Note Moyenne", value: "4.8", icon: Star, color: "bg-black text-white", sub: "/ 5.0" },
                    { label: "Approbation", value: `${stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%`, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", sub: "Taux de validation" },
                    { label: "En Attente", value: stats.pending, icon: Clock, color: "bg-orange-50 text-orange-600", sub: "À modérer" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-black tracking-tighter">{stat.value}</p>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">{stat.sub}</span>
                                </div>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className={`w-6 h-6 ${stat.icon === Star ? 'fill-current' : ''}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Liste des Avis Premium */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <tr>
                                <th className="px-10 py-6">Lecteur & Note</th>
                                <th className="px-10 py-6">Livre Concerné</th>
                                <th className="px-10 py-6">Commentaire</th>
                                <th className="px-10 py-6">État</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <MessageSquare className="w-20 h-20 mb-4" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Aucun avis à modérer</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className="font-black text-black uppercase tracking-tight text-xs italic">{review.fullName}</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                    <Image
                                                        src={review.book.image}
                                                        alt={review.book.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <span className="font-bold text-black text-[10px] uppercase tracking-tight line-clamp-2 max-w-[150px] italic leading-relaxed">
                                                    {review.book.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-gray-600 font-bold italic line-clamp-2 max-w-md leading-relaxed text-xs">
                                                "{review.comment}"
                                            </p>
                                        </td>
                                        <td className="px-10 py-6">
                                            {review.isApproved ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Validé
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-100 shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                    Attente
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!review.isApproved && (
                                                    <form action={async () => {
                                                        'use server'
                                                        await approveReview(review.id)
                                                    }}>
                                                        <button className="p-3 bg-white text-black border border-gray-100 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all shadow-sm active:scale-90">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                )}
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteReview(review.id)
                                                }}>
                                                    <button className="p-3 bg-white text-red-600 border border-red-50 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-90">
                                                        <Trash2 className="w-4 h-4" />
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
        </div>
    )
}
