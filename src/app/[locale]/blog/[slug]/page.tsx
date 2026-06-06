import { getPostBySlug, incrementPostViews, getRelatedPosts } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { Calendar, User, Eye, Tag, MessageSquare, Clock, Pencil, ArrowRight, BookOpen, Quote, Lightbulb, Target, Bookmark } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { remark } from 'remark'
import CommentsSection from '@/components/blog/CommentsSection'
import ShareArticle from '@/components/blog/ShareArticle'
import ReadingProgress from '@/components/blog/ReadingProgress'
import { getTranslations } from 'next-intl/server'
import { getSetting } from '@/lib/actions/site-settings'
import AdBanner from '@/components/AdBanner'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
    const { slug, locale } = await params
    const post = await getPostBySlug(slug, locale)

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
    const post = await getPostBySlug(slug, locale)
    const t = await getTranslations('BlogArticle')

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
            <section className="relative bg-slate-50 overflow-hidden border-b border-slate-100">
                {/* Image de fond floutée */}
                {post.coverImage && (
                    <div className="absolute inset-0 opacity-[0.03] grayscale">
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

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                    {/* Fil d'Ariane + btn admin */}
                    <div className="flex items-center justify-between mb-10">
                        <nav className="flex items-center gap-2 text-[10px] rtl:text-xs font-bold uppercase tracking-[0.2em] rtl:tracking-normal text-slate-400">
                            <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
                            <span>/</span>
                            {post.category && (
                                <>
                                    <Link href={`/blog?category=${post.category}`} className="hover:text-slate-900 transition-colors">{post.category}</Link>
                                    <span>/</span>
                                </>
                            )}
                            <span className="text-slate-500 truncate max-w-[200px]">{post.title}</span>
                        </nav>

                        {isAdmin && (
                            <Link
                                href={`/admin/posts/${post.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 text-[10px] rtl:text-xs font-black uppercase tracking-[0.2em] rtl:tracking-normal rounded-full hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Pencil className="w-3 h-3 text-indigo-600" />
                                {t('Edit')}
                            </Link>
                        )}
                    </div>

                    {/* Catégorie badge */}
                    {post.category && (
                        <div className="mb-6">
                            <Link
                                href={`/blog?category=${post.category}`}
                                className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] rtl:text-xs font-black uppercase tracking-[0.3em] rtl:tracking-normal rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                {post.category}
                            </Link>
                        </div>
                    )}

                    {/* Titre principal */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1] tracking-tighter mb-8 max-w-4xl">
                        {post.title}
                    </h1>

                    {/* Extrait */}
                    {post.excerpt && (
                        <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-3xl font-medium">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Méta */}
                    <div className="flex flex-wrap items-center gap-6 text-[11px] rtl:text-[13px] font-bold uppercase tracking-[0.15em] rtl:tracking-normal text-slate-400 border-t border-slate-200 pt-8">
                        {post.author?.fullName && (
                            <span className="flex items-center gap-2 text-slate-700">
                                {post.author.image ? (
                                    <Image
                                        src={post.author.image}
                                        alt={post.author.fullName}
                                        width={28}
                                        height={28}
                                        className="rounded-full object-cover ring-2 ring-slate-200"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                    </div>
                                )}
                                {post.author.fullName}
                            </span>
                        )}
                        {post.publishedAt && (
                            <span className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {readingTime} {t('MinRead')}
                        </span>
                        <span className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                            {post.viewCount} {t('Views')}
                        </span>
                        {post._count?.comments > 0 && (
                            <span className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                                {post._count.comments} {t('Comments')}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* === IMAGE COVER grande === */}
            {post.coverImage && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-20">
                    <div className="relative group">
                        {/* Decorative background blocks for editorial look */}
                        <div className="absolute inset-0 bg-black rounded-[3rem] rotate-1 group-hover:rotate-2 transition-transform duration-700 opacity-5 shadow-2xl" />
                        <div className="absolute inset-0 bg-gray-200 rounded-[3rem] -rotate-1 group-hover:-rotate-2 transition-transform duration-700 opacity-20" />
                        
                        {/* Main Container */}
                        <div className="relative aspect-[4/3] md:aspect-[21/9] w-full overflow-hidden rounded-[3rem] border-[8px] border-white bg-slate-50 shadow-2xl shadow-black/10 group-hover:-translate-y-2 transition-transform duration-700">
                            {/* Blurred Ambient Background */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={post.coverImage}
                                    alt=""
                                    fill
                                    className="object-cover opacity-30 blur-[40px] scale-125 saturate-150"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent" />
                            </div>
                            
                            {/* Foreground Image */}
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-contain z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                                priority
                                unoptimized
                            />
                            
                            {/* Inner highlight */}
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2.5rem] pointer-events-none z-20" />
                        </div>
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
                            className="prose prose-lg max-w-none rtl:text-[22px] rtl:font-bold rtl:leading-[2.5]
                                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                                prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-gray-100 rtl:prose-h2:text-[34px]
                                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 rtl:prose-h3:text-[30px]
                                prose-p:text-slate-800 prose-p:leading-[1.9] prose-p:text-[17px] rtl:prose-p:text-[22px] rtl:prose-p:leading-[2.5] rtl:prose-p:font-bold prose-p:font-semibold
                                prose-a:text-indigo-600 prose-a:font-semibold prose-a:no-underline prose-a:border-b-2 prose-a:border-indigo-600 hover:prose-a:bg-indigo-50 prose-a:transition-colors
                                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-r-2xl prose-blockquote:py-4 prose-blockquote:not-italic
                                prose-blockquote:text-slate-800 prose-blockquote:font-bold
                                prose-strong:text-slate-900 prose-strong:font-black
                                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:text-rose-600
                                prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-pre:shadow-xl
                                prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto
                                prose-ul:space-y-2 prose-ol:space-y-2
                                prose-li:text-slate-800 prose-li:leading-relaxed prose-li:font-semibold rtl:prose-li:text-[21px] rtl:prose-li:leading-[2.5] rtl:prose-li:font-bold
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
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-slate-900 hover:text-white transition-all"
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
                            <div className="mt-16 p-8 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900">
                                <p className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.3em] rtl:tracking-normal text-slate-400 mb-6">{t('AboutAuthor')}</p>
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {post.author.image ? (
                                            <Image
                                                src={post.author.image}
                                                alt={post.author.fullName || ''}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <User className="w-7 h-7 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black mb-1">{post.author.fullName}</h3>
                                        {post.author.bio && (
                                            <p className="text-sm text-slate-500 leading-relaxed">{post.author.bio}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === Livres Mentionnés (Mobile/Desktop bas d'article) === */}
                        {post.books && post.books.length > 0 && (
                            <div className="mt-12 p-8 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                    {t('InThisArticle')}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {post.books.map(book => (
                                        <Link href={`/books/${book.id}`} key={book.id} className="group flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                            <div className="relative w-24 h-36 sm:w-32 sm:h-48 bg-slate-50 rounded-lg shadow-sm overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                                                {book.image && <Image src={book.image} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{book.title}</h4>
                                                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{book.author}</p>

                                                {book.description && (
                                                    <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                                                        {book.description}
                                                    </p>
                                                )}

                                                {(book.bestQuote || book.bestLessons || book.bestFor || book.bestChapters) && (
                                                    <div className="mt-4 space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                                        {book.bestQuote && (
                                                            <div className="flex gap-3">
                                                                <Quote className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{t('BestQuote')}</p>
                                                                    <p className="text-xs text-slate-700 italic font-medium leading-relaxed">"{book.bestQuote}"</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {book.bestLessons && (
                                                            <div className="flex gap-3">
                                                                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{t('KeyLessons')}</p>
                                                                    <p className="text-xs text-slate-700 leading-relaxed">{book.bestLessons}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {book.bestFor && (
                                                            <div className="flex gap-3">
                                                                <Target className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{t('BestFor')}</p>
                                                                    <p className="text-xs text-slate-700 leading-relaxed">{book.bestFor}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {book.bestChapters && (
                                                            <div className="flex gap-3">
                                                                <Bookmark className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{t('KeyChapters')}</p>
                                                                    <p className="text-xs text-slate-700 leading-relaxed">{book.bestChapters}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-auto pt-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-lg font-black text-indigo-600">{book.price} MAD</p>
                                                        {book.stock > 0 ? (
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t('InStock')}</span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{t('OutOfStock')}</span>
                                                        )}
                                                    </div>
                                                    <div className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full group-hover:bg-indigo-600 transition-colors">
                                                        {t('Discover')}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
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
                                <p className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.3em] rtl:tracking-normal text-gray-400 mb-4">{t('ShareArticle')}</p>
                                <div className="flex flex-col gap-3">
                                    <ShareArticle title={post.title} vertical />
                                </div>
                            </div>

                            {/* Méta article */}
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-slate-900">
                                <p className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.3em] rtl:tracking-normal text-slate-400 mb-5">{t('ArticleInfo')}</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] rtl:text-xs text-slate-400 font-bold uppercase tracking-wider rtl:tracking-normal">{t('Reading')}</p>
                                            <p className="font-bold">{readingTime} {t('Minutes')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] rtl:text-xs text-slate-400 font-bold uppercase tracking-wider rtl:tracking-normal">{t('Views')}</p>
                                            <p className="font-bold">{post.viewCount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {post._count?.comments > 0 && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] rtl:text-xs text-slate-400 font-bold uppercase tracking-wider rtl:tracking-normal">{t('Comments')}</p>
                                                <p className="font-bold">{post._count.comments}</p>
                                            </div>
                                        </div>
                                    )}
                                    {post.publishedAt && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] rtl:text-xs text-slate-400 font-bold uppercase tracking-wider rtl:tracking-normal">{t('PublishedOn')}</p>
                                                <p className="font-bold">{new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags sidebar */}
                            {tags.length > 0 && (
                                <div className="bg-gray-50 rounded-3xl p-6">
                                    <p className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.3em] rtl:tracking-normal text-gray-400 mb-4">{t('Tags')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <Link
                                                key={tag}
                                                href={`/blog?search=${encodeURIComponent(tag)}`}
                                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-[10px] rtl:text-xs font-bold uppercase tracking-wider rtl:tracking-normal rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Livres Mentionnés (Sidebar) */}
                            {post.books && post.books.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                    <p className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.3em] rtl:tracking-normal text-slate-400 mb-5 flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {t('InThisArticle')}
                                    </p>
                                    <div className="space-y-4">
                                        {post.books.map(book => (
                                            <Link href={`/books/${book.id}`} key={book.id} className="group flex gap-4 items-start">
                                                <div className="relative w-12 h-16 bg-slate-100 rounded shadow-sm overflow-hidden flex-shrink-0">
                                                    {book.image && <Image src={book.image} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">{book.title}</h4>
                                                    <p className="text-[10px] text-slate-500 truncate mt-1">{book.author}</p>
                                                    <p className="text-xs font-black text-indigo-600 mt-1">{book.price} MAD</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Blog */}
                            <Link
                                href="/blog"
                                className="group flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-3xl hover:bg-indigo-100 transition-colors"
                            >
                                <div>
                                    <p className="text-[10px] rtl:text-xs font-black uppercase tracking-[0.2em] rtl:tracking-normal text-indigo-400 mb-1">{t('Explore')}</p>
                                    <p className="font-black text-indigo-900 text-sm">{t('AllArticles')}</p>
                                </div>
                                <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                {t('SimilarArticles')}
                            </h2>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                {t('SeeAll')} <ArrowRight className="w-3.5 h-3.5" />
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
                                                className="object-contain group-hover:scale-105 transition-transform duration-700 p-2"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-200 font-black text-2xl">Riwaya</span>
                                            </div>
                                        )}
                                        {related.category && (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.25em] rounded-full">
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
                                                    {new Date(related.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {related.title}
                                        </h3>
                                        {related.excerpt && (
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                                                {related.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">
                                                {t('ReadArticle')}
                                            </span>
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all" />
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
