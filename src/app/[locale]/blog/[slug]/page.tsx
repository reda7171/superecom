import { getPostBySlug, incrementPostViews } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { Calendar, User, Quote, ArrowLeft, Share, Pencil, Eye, Tag, MessageSquare } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { remark } from 'remark'
import CommentsSection from '@/components/blog/CommentsSection'
import Breadcrumbs from '@/components/Breadcrumbs'
import AdBanner from '@/components/AdBanner'
import ShareArticle from '@/components/blog/ShareArticle'
import { getSetting } from '@/lib/actions/site-settings'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) return {}

    return {
        title: `${post.title} | Blog Riwaya`,
        description: post.excerpt || post.title,
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
        notFound()
    }

    // Incrémenter les vues (côté serveur au chargement)
    await incrementPostViews(post.id)

    const cookieStore = await cookies()
    const adminRole = cookieStore.get('admin-role')?.value
    const isAdmin = adminRole === 'ADMIN'

    // Convert markdown to HTML
    const processedContent = await remark()
        .use(remarkHtml, { sanitize: false })
        .use(remarkGfm)
        .process(post.content)
    const contentHtml = processedContent.toString()

    // Parse tags if exist
    const tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []

    // AdSense Configuration
    const adsenseEnabled = await getSetting('adsense_enabled') === 'true'
    const adsensePublisherId = await getSetting('adsense_publisher_id') || ''
    const slotTop = await getSetting('adsense_slot_article_top') || ''
    const slotBottom = await getSetting('adsense_slot_article_bottom') || ''

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Données Structurées pour Google SEO (Article) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "image": post.coverImage,
                        "author": {
                            "@type": "Person",
                            "name": post.author?.fullName || "Riwaya"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Riwaya",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://riwaya.store/logo.png"
                            }
                        },
                        "datePublished": post.createdAt,
                        "dateModified": post.updatedAt,
                        "description": post.excerpt || post.title
                    })
                }}
            />

            {/* Breadcrumbs Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex items-center justify-between">
                <Breadcrumbs 
                    items={[
                        { label: 'Journal', href: '/blog' },
                        { label: post.title }
                    ]} 
                />

                {isAdmin && (
                    <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-gray-800 transition-all shadow-lg mb-6"
                    >
                        <Pencil className="w-3 h-3 text-orange-400" />
                        Modifier l'article
                    </Link>
                )}
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                {/* Header */}
                <header className="text-center mb-16">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 separator-dots">
                        {post.publishedAt && (
                            <span className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                        {post.author?.fullName && (
                            <span className="text-black flex items-center gap-2">
                                <User className="w-3 h-3" />
                                {post.author.fullName}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            {post.viewCount} vues
                        </span>
                        {post._count?.comments > 0 && (
                            <span className="flex items-center gap-2">
                                <MessageSquare className="w-3 h-3" />
                                {post._count.comments} commentaires
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-[0.95] tracking-tighter mb-10">
                        {post.title}
                    </h1>

                    {/* Cover Image */}
                    {post.coverImage && (
                        <div className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl mb-16">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                unoptimized
                            />
                        </div>
                    )}
                </header>

                {/* Top AdSense Banner */}
                {adsenseEnabled && adsensePublisherId && slotTop && (
                    <AdBanner publisherId={adsensePublisherId} slotId={slotTop} />
                )}

                {/* Body */}
                <div 
                    className="prose prose-lg md:prose-xl mx-auto prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:tracking-wide rtl:prose-p:text-justify prose-a:text-black prose-a:no-underline prose-a:border-b-2 prose-a:border-black hover:prose-a:bg-black hover:prose-a:text-white transition-all"
                    style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>

                {/* Bottom AdSense Banner */}
                {adsenseEnabled && adsensePublisherId && slotBottom && (
                    <AdBanner publisherId={adsensePublisherId} slotId={slotBottom} />
                )}

                {/* Tags & Share */}
                <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {tags.map(tag => (
                                <Link 
                                    key={tag} 
                                    href={`/blog?search=${encodeURIComponent(tag)}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all cursor-pointer"
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    ) : <div></div>}

                    <ShareArticle title={post.title} />
                </div>

                {/* Author Bio */}
                {post.author && (
                    <div className="border-t border-gray-100 mt-20 pt-20">
                        <div className="flex items-center gap-8 max-w-2xl mx-auto bg-pixio-cream p-10 rounded-[2rem]">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                {post.author.image ? (
                                    <Image
                                        src={post.author.image}
                                        alt={post.author.fullName || ''}
                                        width={80}
                                        height={80}
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-black mb-1">{post.author.fullName}</h3>
                                {post.author.bio && (
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        {post.author.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <CommentsSection 
                    postId={post.id} 
                    comments={post.comments || []} 
                    totalCount={post._count?.comments || 0}
                />
            </article>

            <Footer />
        </div>
    )
}
