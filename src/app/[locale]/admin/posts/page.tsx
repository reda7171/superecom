import { getAllPosts } from '@/lib/actions/blog'
import Link from 'next/link'
import { Plus, Edit, FileText, Globe, User } from 'lucide-react'
import DeletePostButton from '@/components/admin/DeletePostButton'
import { revalidatePath } from 'next/cache'

export default async function AdminPostsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1
    const search = typeof params.search === 'string' ? params.search : undefined

    const { posts, pagination } = await getAllPosts(page, 20, search)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Articles</h1>
                    <p className="text-sm text-gray-500">Gérez les publications du blog</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel Article
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Titre</th>
                                <th className="px-6 py-4">Auteur</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">Aucun article trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 line-clamp-1 max-w-md">{post.title}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-1">/{post.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {post.author.fullName?.[0] || <User className="w-3 h-3" />}
                                                </div>
                                                <span className="text-gray-600 font-medium">{post.author.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.published ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                    <Globe className="w-3 h-3 mr-1" /> Publié
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                                                    Brouillon
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/posts/${post.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <DeletePostButton id={post.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified) */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <Link
                                key={i}
                                href={`/admin/posts?page=${i + 1}`}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === i + 1
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {i + 1}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
