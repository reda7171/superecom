import { getPostBySlug, incrementPostViews, getRelatedPosts } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { Calendar, User, Eye, Tag, MessageSquare, Clock, Pencil, ArrowRight, BookOpen } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { remark } from 'remark'
import CommentsSection from '@/components/blog/CommentsSection'
import ShareArticle from '@/components/blog/ShareArticle'
import ReadingProgress from '@/components/blog/ReadingProgress'
import { getSetting } from '@/lib/actions/site-settings'
import AdBanner from '@/components/AdBanner'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
    const { slug, locale } = await params
    const post = await getPostBySlug(slug)

    if (!post) return {}

    const siteUrl = 'https://riwaya.store'
    const canonicalUrl = `${siteUrl}/${locale}/blog/${slug}`

    return {
        title: `${post.title} | Blog Riwaya`,
        description: post.excerpt || post.title,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            url: canonicalUrl,
            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.author?.fullName ? [post.author.fullName] : ['Riwaya'],
            images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.title,
            images: post.coverImage ? [post.coverImage] : [],
        },
        alternates: { canonical: canonicalUrl },
    }
}

// Calcule le temps de lecture estimé
function estimateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    const post = await getPostBySlug(slug)

    if (!post) notFound()

    await incrementPostViews(post.id)

    const cookieStore = await cookies()
    const adminRole = cookieStore.get('admin-role')?.value
    const isAdmin = adminRole === 'ADMIN'

    // Convertir markdown → HTML
    const processedContent = await remark()
        .use(remarkHtml, { sanitize: false })
        .use(remarkGfm)
        .process(post.content)
    const contentHtml = processedContent.toString()

    const tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const readingTime = estimateReadingTime(post.content)

    // Articles similaires + config AdSense
    const [relatedPosts, adsenseEnabled, adsensePublisherId, slotTop, slotBottom] = await Promise.all([
        getRelatedPosts(post.id, post.category, locale),
        getSetting('adsense_enabled').then(v => v === 'true'),
        getSetting('adsense_publisher_id').then(v => v || ''),
        getSetting('adsense_slot_article_top').then(v => v || ''),
        getSetting('adsense_slot_article_bottom').then(v => v || ''),
    ])

    return (
        <div className="min-h-screen bg-white" id="article-page">

            {/* Barre de progression lecture */}
            <ReadingProgress />

            <Header />

            {/* Données Structurées Schema.org */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "image": post.coverImage,
                        "author": { "@type": "Person", "name": post.author?.fullName || "Riwaya" },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Riwaya",
                            "logo": { "@type": "ImageObject", "url": "https://riwaya.store/logo.png" }
                        },
                        "datePublished": post.publishedAt,
                        "dateModified": post.updatedAt,
                        "description": post.excerpt || post.title
                    })
                }}
            />

            {/* === HERO === */}
            <section className="relative bg-[#0f0f0f] overflow-hidden">
                {/* Image de fond floutée */}
                {post.coverImage && (
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            src={post.coverImage}
                            alt=""
                            fill
                            className="object-cover blur-2xl scale-110"
                            priority
                            unoptimized
                        />
                    </div>
                )}

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                    {/* Fil d'Ariane + btn admin */}
                    <div className="flex items-center justify-between mb-10">
                        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <span>/</span>
                            {post.category && (
                                <>
                                    <Link href={`/blog?category=${post.category}`} className="hover:text-white transition-colors">{post.category}</Link>
                                    <span>/</span>
                                </>
                            )}
                            <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
                        </nav>

                        {isAdmin && (
                            <Link
                                href={`/admin/posts/${post.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
                            >
                                <Pencil className="w-3 h-3 text-amber-400" />
                                Modifier
                            </Link>
                        )}
                    </div>

                    {/* Catégorie badge */}
                    {post.category && (
                        <div className="mb-6">
                            <Link
                                href={`/blog?category=${post.category}`}
                                className="inline-block px-4 py-1.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-amber-300 transition-colors"
                            >
                                {post.category}
                            </Link>
                        </div>
                    )}

                    {/* Titre principal */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1] tracking-tighter mb-8 max-w-4xl">
                        {post.title}
                    </h1>

                    {/* Extrait */}
                    {post.excerpt && (
                        <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-3xl font-medium">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Méta */}
                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 border-t border-white/10 pt-8">
                        {post.author?.fullName && (
                            <span className="flex items-center gap-2 text-white/70">
                                {post.author.image ? (
                                    <Image
                                        src={post.author.image}
                                        alt={post.author.fullName}
                                        width={28}
                                        height={28}
                                        className="rounded-full object-cover ring-2 ring-white/20"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                )}
                                {post.author.fullName}
                            </span>
                        )}
                        {post.publishedAt && (
                            <span className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {readingTime} min de lecture
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5" />
                            {post.viewCount} vues
                        </span>
                        {post._count?.comments > 0 && (
                            <span className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {post._count.comments} commentaires
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* === IMAGE COVER grande === */}
            {post.coverImage && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-0">
                    <div className="relative aspect-[21/9] w-full overflow-hidden shadow-2xl">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {/* === CONTENU PRINCIPAL === */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16 xl:gap-24">

                    {/* Colonne article */}
                    <div>
                        {/* AdSense haut */}
                        {adsenseEnabled && adsensePublisherId && slotTop && (
                            <AdBanner publisherId={adsensePublisherId} slotId={slotTop} />
                        )}

                        {/* Corps de l'article */}
                        <article
                            id="article-content"
                            className="prose prose-lg max-w-none
                                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[#0f0f0f]
                                prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-gray-100
                                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                                prose-p:text-gray-600 prose-p:leading-[1.9] prose-p:text-[17px]
                                prose-a:text-black prose-a:font-semibold prose-a:no-underline prose-a:border-b-2 prose-a:border-amber-400 hover:prose-a:bg-amber-50 prose-a:transition-colors
                                prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-2xl prose-blockquote:py-4 prose-blockquote:not-italic
                                prose-blockquote:text-gray-700 prose-blockquote:font-medium
                                prose-strong:text-black
                                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:text-rose-600
                                prose-pre:bg-[#0f0f0f] prose-pre:rounded-2xl prose-pre:shadow-xl
                                prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto
                                prose-ul:space-y-2 prose-ol:space-y-2
                                prose-li:text-gray-600 prose-li:leading-relaxed
                                rtl:prose-p:text-justify"
                        >
                            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                        </article>

                        {/* AdSense bas */}
                        {adsenseEnabled && adsensePublisherId && slotBottom && (
                            <AdBanner publisherId={adsensePublisherId} slotId={slotBottom} />
                        )}

                        {/* === Tags & Partage === */}
                        <div className="mt-14 pt-10 border-t-2 border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <Link
                                                key={tag}
                                                href={`/blog?search=${encodeURIComponent(tag)}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-[#0f0f0f] hover:text-white transition-all"
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <ShareArticle title={post.title} />
                            </div>
                        </div>

                        {/* === Bio Auteur === */}
                        {post.author && (
                            <div className="mt-16 p-8 bg-[#0f0f0f] rounded-3xl text-white">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">À propos de l'auteur</p>
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {post.author.image ? (
                                            <Image
                                                src={post.author.image}
                                                alt={post.author.fullName || ''}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <User className="w-7 h-7 text-white/40" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black mb-1">{post.author.fullName}</h3>
                                        {post.author.bio && (
                                            <p className="text-sm text-white/60 leading-relaxed">{post.author.bio}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === Commentaires === */}
                        <CommentsSection
                            postId={post.id}
                            comments={post.comments || []}
                            totalCount={post._count?.comments || 0}
                        />
                    </div>

                    {/* === Sidebar sticky === */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-8">

                            {/* Partage */}
                            <div className="bg-gray-50 rounded-3xl p-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Partager l'article</p>
                                <div className="flex flex-col gap-3">
                                    <ShareArticle title={post.title} vertical />
                                </div>
                            </div>

                            {/* Méta article */}
                            <div className="bg-[#0f0f0f] rounded-3xl p-6 text-white">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-5">Infos article</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Lecture</p>
                                            <p className="font-bold">{readingTime} minutes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Vues</p>
                                            <p className="font-bold">{post.viewCount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {post._count?.comments > 0 && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Commentaires</p>
                                                <p className="font-bold">{post._count.comments}</p>
                                            </div>
                                        </div>
                                    )}
                                    {post.publishedAt && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Publié le</p>
                                                <p className="font-bold">{new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags sidebar */}
                            {tags.length > 0 && (
                                <div className="bg-gray-50 rounded-3xl p-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <Link
                                                key={tag}
                                                href={`/blog?search=${encodeURIComponent(tag)}`}
                                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-[#0f0f0f] hover:text-white hover:border-[#0f0f0f] transition-all"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Blog */}
                            <Link
                                href="/blog"
                                className="group flex items-center justify-between p-5 bg-amber-400 rounded-3xl hover:bg-amber-300 transition-colors"
                            >
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60 mb-1">Explorer</p>
                                    <p className="font-black text-black text-sm">Tous les articles</p>
                                </div>
                                <div className="w-9 h-9 bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>

            {/* === ARTICLES SIMILAIRES === */}
            {relatedPosts.length > 0 && (
                <section className="bg-gray-50 py-20 border-t border-gray-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-black text-[#0f0f0f] tracking-tight">
                                Articles similaires
                            </h2>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
                            >
                                Voir tout <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/blog/${related.slug}`}
                                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        {related.coverImage ? (
                                            <Image
                                                src={related.coverImage}
                                                alt={related.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-200 font-black text-2xl">Riwaya</span>
                                            </div>
                                        )}
                                        {related.category && (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-amber-400 text-black text-[9px] font-black uppercase tracking-[0.25em] rounded-full">
                                                    {related.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                                            {related.publishedAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(related.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-[#0f0f0f] text-lg leading-tight mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                                            {related.title}
                                        </h3>
                                        {related.excerpt && (
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                                                {related.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors">
                                                Lire l'article
                                            </span>
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#0f0f0f] transition-colors">
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    )
}
