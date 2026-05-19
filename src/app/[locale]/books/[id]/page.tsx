import { getBookById, getBooks, getPopularBooks } from '@/lib/db/books'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import BookCard from '@/components/BookCard'
import WishlistButton from '@/components/WishlistButton'
import { normalizeImage } from '@/lib/utils'
import { ArrowLeft, Star, Truck, Shield, Package, MessageSquare, Quote, Sparkles, CheckCircle2, Edit2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import { getBookReviews, getBookAverageRating } from '@/lib/actions/reviews'
import { getCategoryConfigByName } from '@/lib/actions/categories'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { Metadata } from 'next'
import SetPixelView from '@/components/SetPixelView'
import ImageWithFallback from '@/components/ImageWithFallback'
import WhatsAppOrderButton from '@/components/WhatsAppOrderButton'
import { getSetting } from '@/lib/actions/site-settings'
import AnnouncementBar from '@/components/AnnouncementBar'
import { getPostsByBookId } from '@/lib/actions/blog'
import Image from 'next/image'
import { Calendar, User as UserIcon, ArrowUpRight, FileText } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
    const { id, locale } = await params
    const book = await getBookById(id)

    if (!book) {
        return {
            title: 'Livre introuvable | Riwaya',
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.store'
    const normalizedImage = normalizeImage(book.image)
    const imageUrl = normalizedImage.startsWith('http') ? normalizedImage : normalizedImage.startsWith('data:') ? normalizedImage : `${baseUrl}${normalizedImage}`

    // Générer des mots-clés SEO pertinents
    const keywords = [
        book.title,
        book.author,
        `${book.title} ${book.author}`,
        `acheter ${book.title} maroc`,
        `${book.category} maroc`,
        `livre ${book.category}`,
        `${book.author} livres`,
        'livres maroc',
        'librairie en ligne maroc',
        book.language === 'FR' ? 'livre français maroc' : book.language === 'AR' ? 'livre arabe maroc' : 'livre anglais maroc',
    ].filter(Boolean)

    return {
        title: `${book.title} - ${book.author} | Riwaya`,
        description: `Achetez "${book.title}" de ${book.author} sur Riwaya. ${book.description.slice(0, 120)}... Livraison rapide au Maroc. Prix: ${book.price} MAD. ${book.stock > 0 ? 'En stock' : 'Rupture de stock'}.`,
        keywords,
        openGraph: {
            title: `${book.title} - ${book.author}`,
            description: book.description.slice(0, 160) + '...',
            images: [imageUrl],
            type: 'book',
            locale: locale === 'ar' ? 'ar_MA' : locale === 'en' ? 'en_MA' : 'fr_MA',
            url: `${baseUrl}/${locale}/books/${book.id}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${book.title} - ${book.author}`,
            description: book.description.slice(0, 160) + '...',
            images: [imageUrl],
        },
        alternates: {
            canonical: `/${locale}/books/${book.id}`,
            languages: {
                'fr': `/fr/books/${book.id}`,
                'ar': `/ar/books/${book.id}`,
                'en': `/en/books/${book.id}`,
            },
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
    const user = await getCommunityUser()
    const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin@riwaya.com'

    if (!book) {
        notFound()
    }

    // Récupérer les avis, note moyenne, citation et livres populaires pour cross-sell
    const [reviews, ratingData, categoryConfig, popularBooksForCrossSell, whatsappPhone, announcementEnabled, announcementMessage, announcementBgColor, announcementTextColor, relatedPosts] = await Promise.all([
        getBookReviews(id),
        getBookAverageRating(id),
        book.category ? getCategoryConfigByName(book.category) : Promise.resolve(null),
        getPopularBooks(6),
        getSetting('contact_whatsapp'),
        getSetting('announcement_bar_enabled'),
        getSetting('announcement_bar_message'),
        getSetting('announcement_bar_bg_color'),
        getSetting('announcement_bar_text_color'),
        getPostsByBookId(id, locale)
    ])

    const { average: averageRating, count: reviewCount } = ratingData

    // Livres similaires (même catégorie)
    const similarBooks = book.category
        ? await getBooks({ category: book.category, active: true })
        : []
    const filteredSimilarBooks = similarBooks
        .filter((b) => b.id !== book.id)
        .slice(0, 4)

    // Souvent achetés ensemble (cross-sell)
    const frequentlyBoughtTogether = popularBooksForCrossSell
        .filter((b) => b.id !== book.id && !filteredSimilarBooks.some((sim) => sim.id === b.id))
        .slice(0, 2)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.store'
    const normalizedImage = normalizeImage(book.image)
    const imageUrl = normalizedImage.startsWith('http') ? normalizedImage : normalizedImage.startsWith('data:') ? normalizedImage : `${baseUrl}${normalizedImage}`

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
                <SetPixelView
                    id={book.id}
                    title={book.title}
                    price={book.price}
                    category={book.category || undefined}
                />

                <AnnouncementBar
                    message={announcementMessage || ""}
                    isEnabled={announcementEnabled === 'true'}
                    bgColor={announcementBgColor || "#000000"}
                    textColor={announcementTextColor || "#FFFFFF"}
                />



                <Header />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
                    {/* Breadcrumb Section */}
                    <Breadcrumbs 
                        items={[
                            { label: tNav('Books'), href: '/books' },
                            { label: book.title }
                        ]} 
                    />

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
                                    <ImageWithFallback
                                        src={book.image}
                                        alt={book.title}
                                        className="w-full h-full object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-[1.02]"
                                    />
                                    {book.stock <= 5 && book.stock > 0 && (
                                        <div className="absolute top-6 right-6 rtl:left-6 rtl:right-auto z-20">
                                            <span className="px-5 py-2.5 bg-black text-white text-[9px] font-black rounded-full shadow-2xl animate-pulse uppercase tracking-widest">
                                                {tBook('OnlyLeft', { stock: book.stock })}
                                            </span>
                                        </div>
                                    )}
                                    {book.stock === 0 && (
                                        <div className="absolute top-0 left-0 w-48 h-48 overflow-hidden z-20 pointer-events-none rounded-tl-[2rem]">
                                            <div className="absolute top-10 -left-12 w-64 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-[0.2em] text-center -rotate-45 shadow-2xl border-y-4 border-red-400/30 backdrop-blur-sm">
                                                {tBook('OutOfStock')}
                                            </div>
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
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    {book.category && (
                                        <Link
                                            href={`/books?category=${encodeURIComponent(book.category)}`}
                                            className="inline-block px-5 py-2 bg-black text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:bg-gray-800 transition-all"
                                        >
                                            {book.category}
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <a
                                            href={`/fr/admin/books/${book.id}/edit`}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 ring-2 ring-white"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Modifier ce livre
                                        </a>
                                    )}
                                </div>

                                <h1 className="text-5xl md:text-7xl font-black text-black leading-none tracking-tighter">
                                    {book.title}<span className="text-gray-200">.</span>
                                </h1>

                                <p className="text-xl font-black text-gray-300 uppercase tracking-widest">
                                    {tCommon('By')} <Link href={`/authors/${encodeURIComponent(book.author)}`} className="hover:text-black transition-colors border-b-2 border-transparent hover:border-black">{book.author}</Link>
                                </p>
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
                                    <div className="space-y-4">
                                        <WhatsAppOrderButton
                                            title={book.title}
                                            price={book.price}
                                            phone={whatsappPhone || undefined}
                                            type="book"
                                        />
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
                                        {(book as any).previewUrl && (
                                            <a
                                                href={(book as any).previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center py-4 text-xs font-black text-black border-2 border-black rounded-full uppercase tracking-widest hover:bg-gray-50 transition-colors mt-4"
                                            >
                                                Lire un extrait
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Frequently Bought Together (Upsell/Cross-sell) */}
                            {frequentlyBoughtTogether.length > 0 && (
                                <div className="mt-12 bg-gray-50 p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-6">{tBook('FrequentlyBoughtTogether')}</h3>
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        {frequentlyBoughtTogether.map(fbBook => (
                                            <div key={fbBook.id} className="flex items-center gap-3 sm:gap-4 bg-white p-2.5 sm:p-3 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                                                <Link href={`/books/${fbBook.id}`} target="_blank" rel="noopener noreferrer" className="flex gap-3 sm:gap-4 items-center flex-1 min-w-0 group">
                                                    <div className="relative w-12 h-16 sm:w-16 sm:h-20 flex-shrink-0 overflow-hidden rounded-xl">
                                                        <ImageWithFallback
                                                            src={fbBook.image}
                                                            alt={fbBook.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-xs font-black text-black group-hover:text-gray-600 line-clamp-1 truncate block transition-colors">{fbBook.title}</span>
                                                        <p className="text-[9px] font-bold text-gray-400 mt-0.5 sm:mt-1 truncate">{fbBook.author}</p>
                                                        <p className="text-[10px] font-black text-black mt-1.5 sm:mt-2">{fbBook.price} MAD</p>
                                                    </div>
                                                </Link>
                                                <AddToCartButton
                                                    product={{
                                                        id: fbBook.id,
                                                        title: fbBook.title,
                                                        price: fbBook.price,
                                                        image: fbBook.image,
                                                        type: 'BOOK'
                                                    }}
                                                    showIcon={false}
                                                    className="!px-3 sm:!px-4 !py-2.5 sm:!py-3 text-[8px] sm:text-[9px] uppercase tracking-widest font-black !rounded-xl !w-auto flex-shrink-0 shadow-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tabs Layout */}
                            <div className="flex flex-col gap-12 pt-12 border-t border-gray-100">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Package className="w-4 h-4 text-black" />
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">{tBook('Abstract')}</h2>
                                    </div>
                                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose bg-white p-10 rounded-[2.5rem] border border-gray-50 italic space-y-4">
                                        <p>{book.description}</p>
                                        {book.longDescription && (
                                            <p className="text-gray-600 font-medium normal-case tracking-normal mt-4">{book.longDescription}</p>
                                        )}
                                    </div>
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

                    {/* Related Blog Posts - Articles parlant de ce produit */}
                    {relatedPosts && relatedPosts.length > 0 && (
                        <section className="py-32 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 px-2">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lecture</span>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter">
                                        L'article parle de ce produit<span className="text-blue-500">.</span>
                                    </h2>
                                </div>
                                <Link 
                                    href="/blog" 
                                    className="text-[10px] font-black text-black uppercase tracking-widest bg-white px-8 py-4 rounded-full border border-gray-100 shadow-sm hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    Voir tout le journal
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {relatedPosts.map((post: any) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="group relative bg-white rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
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
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">
                                                {post.publishedAt && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-black text-black leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-black">
                                                <span>Lire l'article</span>
                                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

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
