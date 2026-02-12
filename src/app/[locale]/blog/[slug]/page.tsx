import { getPostBySlug } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Calendar, User, Quote, ArrowLeft, Share } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Metadata } from 'next'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { remark } from 'remark'

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

    // Convert markdown to HTML
    const processedContent = await remark()
        .use(remarkHtml)
        .use(remarkGfm)
        .process(post.content)
    const contentHtml = processedContent.toString()

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Back to Blog */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au Journal
                </Link>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                {/* Header */}
                <header className="text-center mb-16">
                    <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 separator-dots">
                        {post.publishedAt && (
                            <span>
                                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                        {post.author?.fullName && (
                            <span className="text-black">{post.author.fullName}</span>
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

                {/* Body */}
                <div className="prose prose-lg mx-auto prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-black prose-a:no-underline prose-a:border-b-2 prose-a:border-black hover:prose-a:bg-black hover:prose-a:text-white transition-all">
                    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
            </article>

            <Footer />
        </div>
    )
}
