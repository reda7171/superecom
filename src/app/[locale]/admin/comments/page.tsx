import { getAllComments, approveComment, deleteComment } from '@/lib/actions/comments'
import { MessageSquare, Check, Trash2, Clock, User, ExternalLink } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const metadata = {
    title: 'Modération des Commentaires | Admin SuperEcom',
}

export default async function AdminCommentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const sp = await searchParams
    const page = parseInt(sp.page || '1')
    const { comments, pagination } = await getAllComments(page)

    async function handleApprove(id: string) {
        'use server'
        await approveComment(id)
        revalidatePath('/admin/comments')
    }

    async function handleDelete(id: string) {
        'use server'
        await deleteComment(id)
        revalidatePath('/admin/comments')
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-black tracking-tight">Modération</h1>
                    <p className="text-sm text-gray-500 font-medium">Gérez les commentaires de vos articles de blog</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Auteur</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Commentaire</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Article</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                                    Aucun commentaire trouvé.
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment: any) => (
                                <tr key={comment.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-pixio-cream rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-black" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-black">
                                                    {comment.user?.fullName || comment.authorName || 'Anonyme'}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400">
                                                    {comment.user?.email || 'Visiteur'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md font-medium italic">
                                            "{comment.content}"
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-bold flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(comment.createdAt).toLocaleString('fr-FR')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <a 
                                            href={`/blog/${comment.post.slug}`} 
                                            target="_blank"
                                            className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:underline"
                                        >
                                            {comment.post.title}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                    <td className="px-6 py-5">
                                        {comment.isApproved ? (
                                            <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-full border border-green-100">
                                                Approuvé
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-100">
                                                En attente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!comment.isApproved && (
                                                <form action={handleApprove.bind(null, comment.id)}>
                                                    <button className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            )}
                                            <form action={handleDelete.bind(null, comment.id)}>
                                                <button className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
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
    )
}
