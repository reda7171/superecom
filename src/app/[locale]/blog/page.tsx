import { getPublishedPosts } from '@/lib/actions/blog'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { ArrowRight, Calendar, User, Quote, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams
    const t = await getTranslations('Blog')
    const page = Number(params.page) || 1
    const { posts, pagination } = await getPublishedPosts(page)

    return (
        <div className="min-h-screen bg-pixio-cream font-sans">
            <Header />

            {/* Hero Section */}
            <div className="bg-pixio-beige pt-20 pb-20 relative overflow-hidden">
                <Quote className="absolute -top-10 -right-10 w-64 h-64 text-pixio-cream opacity-50 -rotate-12" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-6">
                        <Sparkles className="w-4 h-4 text-pixio-yellow" />
                        <span>{t('Badge')}</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-black mb-6 tracking-tighter">
                        {t('Title')}
                    </h1>
                    <p className="text-lg text-gray-500 uppercase font-bold tracking-widest max-w-2xl mx-auto">
                        {t('Subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                            {t('NoPosts')}
                        </p>
                        <p className="text-xs text-gray-300 mt-2 font-medium">
                            {t('ComingSoon')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts.map((post: any, idx: number) => (
                            <Link
                                href={`/blog/${post.slug}`}
                                key={post.id}
                                className={`group relative bg-white rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col ${idx === 0 ? 'md:col-span-2 lg:col-span-3 lg:flex-row lg:h-[500px]' : 'h-full'}`}
                            >
                                {/* Image */}
                                <div className={`relative overflow-hidden bg-gray-100 ${idx === 0 ? 'w-full lg:w-1/2 h-64 lg:h-full' : 'aspect-[4/3]'}`}>
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                            <span className="text-gray-300 font-black text-4xl opacity-20">Riwaya</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col justify-center p-8 ${idx === 0 ? 'lg:w-1/2 lg:p-12' : ''}`}>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                                        {post.publishedAt && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {post.author?.fullName && (
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span>{post.author.fullName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h2 className={`font-black text-black leading-tight mb-4 group-hover:text-pixio-pink transition-colors ${idx === 0 ? 'text-3xl md:text-5xl' : 'text-2xl'}`}>
                                        {post.title}
                                    </h2>

                                    {post.excerpt && (
                                        <p className="text-gray-500 font-medium leading-relaxed mb-8 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black group-hover:tracking-[0.3em] transition-all">
                                            {t('ReadArticle')}
                                        </span>
                                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:bg-pixio-pink transition-colors">
                                            <ArrowRight className="w-4 h-4 text-white -rotate-45 group-hover:rotate-0 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-20 flex justify-center gap-2">
                        {/* Simple pagination logic could be improved */}
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <Link
                                key={i}
                                href={`/blog?page=${i + 1}`}
                                className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-black transition-all ${page === i + 1
                                    ? 'bg-black text-white shadow-xl'
                                    : 'bg-white text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {i + 1}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
