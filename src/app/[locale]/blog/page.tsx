import { getPublishedPosts, getPostCategories } from '@/lib/actions/blog'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { ArrowRight, Calendar, User, Quote, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import AdUnit from '@/components/AdUnit'
import { getSetting } from '@/lib/actions/site-settings'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const revalidate = 3600 // Cache d'une heure (ISR)

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ locale: string }> 
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Blog' })
    
    return {
        title: `${t('Title')} | Riwaya`,
        description: t('Subtitle'),
        openGraph: {
            title: `${t('Title')} | Riwaya`,
            description: t('Subtitle'),
            type: 'website',
            url: `https://riwaya.com/${locale}/blog`,
        },
        alternates: {
            canonical: `https://riwaya.com/${locale}/blog`
        }
    }
}
export default async function BlogPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ page?: string; category?: string }> 
}) {
    const { locale } = await params
    const sParams = await searchParams
    const t = await getTranslations('Blog')
    const page = Number(sParams.page) || 1
    const category = sParams.category || undefined
    const [{ posts, pagination }, categories, adsenseId, adsenseEnabled, adsenseSidebarSlot] = await Promise.all([
        getPublishedPosts(page, 9, category, locale),
        getPostCategories(locale),
        getSetting('adsense_publisher_id'),
        getSetting('adsense_enabled'),
        getSetting('adsense_slot_sidebar')
    ])

    return (
        <div className="min-h-screen bg-pixio-cream font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Blog",
                        "name": `${t('Title')} | Riwaya`,
                        "description": t('Subtitle'),
                        "url": `https://riwaya.com/${locale}/blog`
                    })
                }}
            />
            <Header />

            {/* Hero Section */}
            <div className="bg-pixio-beige pt-20 pb-20 relative overflow-hidden">
                <Quote className="absolute -top-10 -right-10 w-64 h-64 text-pixio-cream opacity-50 -rotate-12" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-6 hover:scale-105 transition-transform duration-300">
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                        <span>{t('Badge')}</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-black mb-6 tracking-tighter hover:scale-[1.02] transition-transform duration-500">
                        {t('Title')}
                    </h1>
                    <p className="text-lg text-gray-600 uppercase font-bold tracking-widest max-w-2xl mx-auto leading-relaxed">
                        {t('Subtitle')}
                    </p>
                </div>

                {/* Categories Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/blog"
                            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 ${!category ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black shadow-sm border border-gray-100'}`}
                        >
                            Tous
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={`/blog?category=${cat}`}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 ${category === cat ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black shadow-sm border border-gray-100'}`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <AdUnit 
                publisherId={adsenseId || ""} 
                slot={adsenseSidebarSlot || "blog_top_horizontal"} 
                isEnabled={adsenseEnabled === 'true'} 
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {posts.length === 0 ? (
                    <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-black uppercase tracking-widest text-lg">
                            {t('NoPosts')}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 font-medium max-w-sm mx-auto">
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
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 bg-gray-50"
                                            priority={idx === 0}
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
                                        {post.category && (
                                            <div className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-full text-[8px]">
                                                <span>{post.category}</span>
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
                    <div className="mt-16 md:mt-24 flex flex-wrap items-center justify-center gap-2 md:gap-4">
                        {/* Previous Button */}
                        {page > 1 ? (
                            <Link
                                href={`/blog?page=${page - 1}${category ? `&category=${category}` : ''}`}
                                aria-label="Page précédente"
                                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border border-gray-100 text-black hover:bg-black hover:text-white transition-all shadow-sm hover:scale-105 duration-300"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                        ) : (
                            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5" />
                            </div>
                        )}

                        {/* Page Numbers */}
                        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 bg-white px-2 py-2 md:px-4 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                            {Array.from({ length: pagination.totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                const isCurrent = page === pageNum;
                                return (
                                    <Link
                                        key={i}
                                        href={`/blog?page=${pageNum}${category ? `&category=${category}` : ''}`}
                                        aria-label={`Aller à la page ${pageNum}`}
                                        aria-current={isCurrent ? "page" : undefined}
                                        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl text-xs font-black transition-all duration-300 hover:scale-110 ${isCurrent
                                            ? 'bg-black text-white'
                                            : 'text-gray-400 hover:text-black hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Next Button */}
                        {page < pagination.totalPages ? (
                            <Link
                                href={`/blog?page=${page + 1}${category ? `&category=${category}` : ''}`}
                                aria-label="Page suivante"
                                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border border-gray-100 text-black hover:bg-black hover:text-white transition-all shadow-sm hover:scale-105 duration-300"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
