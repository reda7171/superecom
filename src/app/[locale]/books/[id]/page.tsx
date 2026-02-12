import { getBookById, getBooks } from '@/lib/db/books'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import BookCard from '@/components/BookCard'
import WishlistButton from '@/components/WishlistButton'
import Image from 'next/image'
import { ArrowLeft, Star, Truck, Shield, Package, MessageSquare, Quote, Sparkles, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import { getBookReviews, getBookAverageRating } from '@/lib/actions/reviews'
import { getCategoryConfigByName } from '@/lib/actions/categories'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Metadata } from 'next'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
    const { id } = await params
    const book = await getBookById(id)

    if (!book) {
        return {
            title: 'Livre introuvable | Riwaya',
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'
    const imageUrl = book.image.startsWith('http') ? book.image : `${baseUrl}${book.image}`

    return {
        title: `${book.title} - ${book.author} | Riwaya`,
        description: book.description.slice(0, 160) + '...',
        openGraph: {
            title: book.title,
            description: book.description.slice(0, 160) + '...',
            images: [imageUrl],
            type: 'book',
        },
    }
}

export default async function BookDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id, locale } = await params
    const tBook = await getTranslations('BookDetail');
    const tCommon = await getTranslations('Common');
    const tNav = await getTranslations('Navigation');

    const book = await getBookById(id)

    if (!book) {
        notFound()
    }

    // Récupérer les avis, note moyenne et citation
    const [reviews, ratingData, categoryConfig] = await Promise.all([
        getBookReviews(id),
        getBookAverageRating(id),
        book.category ? getCategoryConfigByName(book.category) : Promise.resolve(null)
    ])

    const { average: averageRating, count: reviewCount } = ratingData

    // Livres similaires (même catégorie)
    const similarBooks = book.category
        ? await getBooks({ category: book.category, active: true })
        : []
    const filteredSimilarBooks = similarBooks
        .filter((b) => b.id !== book.id)
        .slice(0, 4)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'
    const imageUrl = book.image.startsWith('http') ? book.image : `${baseUrl}${book.image}`

    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'Book',
            name: book.title,
            author: {
                '@type': 'Person',
                name: book.author,
            },
            image: imageUrl,
            description: book.description,
            isbn: book.isbn,
            offers: {
                '@type': 'Offer',
                price: book.price,
                priceCurrency: 'MAD',
                availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                url: `${baseUrl}/books/${book.id}`,
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: averageRating || 5,
                reviewCount: reviewCount || 1,
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Accueil',
                    item: baseUrl
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Livres',
                    item: `${baseUrl}/books`
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: book.title,
                    item: `${baseUrl}/books/${book.id}`
                }
            ]
        }
    ]

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
            />
            <div className="min-h-screen bg-pixio-cream">

                <Header />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-12">
                        <Link href="/" className="hover:text-black transition-colors">{tNav('Home')}</Link>
                        <span className="text-gray-200">/</span>
                        <Link href="/books" className="hover:text-black transition-colors">{tNav('Books')}</Link>
                        <span className="text-gray-200">/</span>
                        <span className="text-black">{book.title}</span>
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/books"
                        className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-12 group transition-colors rtl:flex-row-reverse"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:translate-x-1" />
                        <span>{tBook('BackToSelection')}</span>
                    </Link>

                    {/* Product Detail */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
                        {/* Image */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-black/5 border border-gray-100 flex flex-col gap-10">
                                <div className="relative aspect-[3/4] group">
                                    <div className="absolute top-6 left-6 z-10 rtl:right-6 rtl:left-auto">
                                        <WishlistButton
                                            item={{
                                                id: book.id,
                                                title: book.title,
                                                price: book.price,
                                                image: book.image,
                                                type: 'BOOK',
                                                slug: `/books/${book.id}`,
                                                author: book.author
                                            }}
                                            className="bg-white/90 backdrop-blur-md shadow-2xl hover:bg-white w-12 h-12 rounded-full"
                                        />
                                    </div>
                                    <Image
                                        src={book.image}
                                        alt={book.title}
                                        fill
                                        className="object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-[1.02]"
                                        priority
                                        unoptimized
                                    />
                                    {book.stock <= 5 && book.stock > 0 && (
                                        <div className="absolute top-6 right-6 rtl:left-6 rtl:right-auto">
                                            <span className="px-5 py-2.5 bg-black text-white text-[9px] font-black rounded-full shadow-2xl animate-pulse uppercase tracking-widest">
                                                {tBook('OnlyLeft', { stock: book.stock })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-50">
                                    <div className="text-center group cursor-pointer">
                                        <div className="w-14 h-14 bg-pixio-beige rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Truck className="w-6 h-6 text-black" />
                                        </div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{tBook('FastMove')}</p>
                                    </div>
                                    <div className="text-center group cursor-pointer">
                                        <div className="w-14 h-14 bg-pixio-pink rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Shield className="w-6 h-6 text-black" />
                                        </div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{tBook('Secured')}</p>
                                    </div>
                                    <div className="text-center group cursor-pointer">
                                        <div className="w-14 h-14 bg-pixio-yellow rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Package className="w-6 h-6 text-black" />
                                        </div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{tBook('Original')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-12">
                            <div className="space-y-6">
                                {book.category && (
                                    <Link
                                        href={`/books?category=${encodeURIComponent(book.category)}`}
                                        className="inline-block px-5 py-2 bg-black text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:bg-gray-800 transition-all"
                                    >
                                        {book.category} {/* Category names often stay in En/Original unless we map them */}
                                    </Link>
                                )}

                                <h1 className="text-5xl md:text-7xl font-black text-black leading-none tracking-tighter">
                                    {book.title}<span className="text-gray-200">.</span>
                                </h1>

                                <p className="text-xl font-black text-gray-300 uppercase tracking-widest">{tCommon('By')} {book.author}</p>
                            </div>

                            {/* Rating Summary */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-50">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.round(averageRating) ? 'fill-black text-black' : 'text-gray-100'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-black ml-2 uppercase tracking-widest">{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {reviews.length > 0 ? tBook('ReaderReviews', { count: reviews.length }) : tBook('BeFirstToReview')}
                                </span>
                            </div>

                            {/* Price Section */}
                            <div className="relative group">
                                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-2xl shadow-black/5">
                                    <div className="flex items-baseline gap-3 mb-4">
                                        <span className="text-7xl font-black text-black tracking-tighter leading-none">{book.price}</span>
                                        <span className="text-xl font-black text-gray-300 uppercase tracking-widest">MAD</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-black" />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {tBook('TaxesIncluded')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="space-y-8">
                                {book.stock > 0 ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black text-black uppercase tracking-widest">{tBook('ReadyForCollection')}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{tBook('OutOfStock')}</p>
                                    </div>
                                )}

                                {book.stock > 0 && (
                                    <AddToCartButton
                                        product={{
                                            id: book.id,
                                            title: book.title,
                                            price: book.price,
                                            image: book.image,
                                            type: 'BOOK'
                                        }}
                                        className="!py-8 text-xs uppercase tracking-[0.3em] font-black !rounded-full shadow-2xl hover:shadow-black/20"
                                    />
                                )}
                            </div>

                            {/* Tabs Layout */}
                            <div className="flex flex-col gap-12 pt-12 border-t border-gray-100">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Package className="w-4 h-4 text-black" />
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">{tBook('Abstract')}</h2>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose bg-white p-10 rounded-[2.5rem] border border-gray-50 italic">
                                        {book.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                                        <h2 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">{tBook('Technical')}</h2>
                                        <dl className="space-y-5">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <dt className="text-[8px] font-black uppercase tracking-widest text-gray-300">{tBook('Reference')}</dt>
                                                <dd className="text-[10px] font-black text-black tracking-widest">{book.isbn || 'RIWAYA-GEN'}</dd>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <dt className="text-[8px] font-black uppercase tracking-widest text-gray-300">{tBook('Volume')}</dt>
                                                <dd className="text-[10px] font-black text-black tracking-widest">~{Math.floor(Math.random() * 200) + 150} {tBook('Pages')}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div className="bg-black p-10 rounded-[2.5rem] text-white flex flex-col justify-center space-y-6 shadow-2xl shadow-black/10">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-pixio-pink">{tBook('RiwayaSelect')}</h2>
                                        <ul className="space-y-4">
                                            <li className="text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-1 h-1 bg-pixio-pink rounded-full" />
                                                {tBook('OriginalMasterpiece')}
                                            </li>
                                            <li className="text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-1 h-1 bg-pixio-pink rounded-full" />
                                                {tBook('PremiumPaperQual')}
                                            </li>
                                            <li className="text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-1 h-1 bg-pixio-pink rounded-full" />
                                                {tBook('GlobalStandard')}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Category Quote (Cultural Aspect) */}
                            {categoryConfig?.quote && (
                                <div className="mt-32 relative group">
                                    <div className="absolute inset-0 bg-white rounded-[3rem] rotate-1 group-hover:rotate-0 transition-transform shadow-2xl shadow-black/5" />
                                    <div className="relative z-10 p-16 md:p-24 text-center">
                                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-12">
                                            <Sparkles className="w-3 h-3 text-pixio-yellow" />
                                            {tBook('CulturalSelect')}
                                        </div>
                                        <Quote className="absolute top-12 left-12 rtl:right-12 rtl:left-auto w-24 h-24 text-pixio-cream opacity-50 -rotate-12 rtl:rotate-12" />
                                        <p className="text-2xl md:text-5xl font-black text-black leading-tight tracking-tighter mb-10 italic max-w-4xl mx-auto">
                                            "{categoryConfig.quote}"
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                            — {categoryConfig.quoteSource}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <section className="py-32 border-t border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
                            <div className="lg:col-span-1 space-y-10">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-black text-white rounded-[1.5rem] flex items-center justify-center mb-8">
                                        <MessageSquare className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-4xl font-black text-black tracking-tighter">{tBook('Voices')}<span className="text-gray-200">.</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                                        {tBook('SharePerspective')}
                                    </p>
                                </div>
                                <ReviewForm bookId={book.id} />
                            </div>
                            <div className="lg:col-span-2 space-y-12">
                                <h3 className="text-sm font-black text-black uppercase tracking-[0.3em]">
                                    {tBook('Reflections', { count: reviews.length })}
                                </h3>
                                <ReviewList reviews={reviews} />
                            </div>
                        </div>
                    </section>

                    {/* Similar Books */}
                    {filteredSimilarBooks.length > 0 && (
                        <section className="py-32 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-20 px-2">
                                <h2 className="text-4xl font-black text-black tracking-tighter">{tBook('RecommendedReads')}<span className="text-gray-200">.</span></h2>
                                <Link href="/books" className="text-[10px] font-black text-black uppercase tracking-widest bg-white px-8 py-4 rounded-full border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                    {tBook('ExploreAll')}
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                                {filteredSimilarBooks.map((similarBook) => (
                                    <BookCard key={similarBook.id} {...similarBook} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
                <Footer />
            </div>
        </>
    )
}
