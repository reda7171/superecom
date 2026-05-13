import { getAllPosts } from '@/lib/actions/blog'
import Link from 'next/link'
import { Plus, Edit, FileText, Globe, User, ExternalLink, TrendingUp } from 'lucide-react'
import DeletePostButton from '@/components/admin/DeletePostButton'
import { revalidatePath } from 'next/cache'

export default async function AdminPostsPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { locale } = await params
    const searchParamsValues = await searchParams
    const page = typeof searchParamsValues.page === 'string' ? parseInt(searchParamsValues.page) : 1
    const search = typeof searchParamsValues.search === 'string' ? searchParamsValues.search : undefined

    const { posts, pagination } = await getAllPosts(page, 20, search)

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2">
                        Articles<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Gestion du contenu éditorial & Blog
                    </p>
                </div>
                
                <Link
                    href={`/${locale}/admin/posts/new`}
                    className="bg-black text-white px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    Nouvel Article
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Articles", value: pagination.total, icon: FileText, color: "bg-black" },
                    { label: "Articles Publiés", value: posts.filter(p => p.published).length, icon: Globe, color: "bg-blue-600" },
                    { label: "Brouillons", value: posts.filter(p => !p.published).length, icon: Edit, color: "bg-gray-200" },
                    { label: "Vues Globales", value: "---", icon: TrendingUp, color: "bg-emerald-500" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${stat.color === 'bg-gray-200' ? 'text-gray-600' : 'text-white'}`} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-black tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <tr>
                                <th className="px-8 py-6">Contenu</th>
                                <th className="px-8 py-6">Auteur</th>
                                <th className="px-8 py-6">Statut</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-16 h-16 mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Aucun article pour le moment</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-black line-clamp-1 max-w-md uppercase tracking-tight group-hover:text-blue-600 transition-colors">{post.title}</div>
                                            <div className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">/{post.slug}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                                                    {post.author.fullName?.[0] || <User className="w-4 h-4" />}
                                                </div>
                                                <span className="text-gray-600 font-bold text-xs">{post.author.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {post.published ? (
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Publié
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                                                    Brouillon
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-gray-400 font-bold text-xs uppercase">
                                            {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`/${locale}/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Voir l'article"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <Link
                                                    href={`/${locale}/admin/posts/${post.id}`}
                                                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
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
                    <div className="px-8 py-8 border-t border-gray-100 flex justify-center gap-3 bg-gray-50/30">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <Link
                                key={i}
                                href={`/${locale}/admin/posts?page=${i + 1}`}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page === i + 1
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
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
