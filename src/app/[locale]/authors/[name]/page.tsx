
import { getBooks } from '@/lib/db/products'
import { getAuthorProfile } from '@/lib/db/authors'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import ProductCard from '@/components/ProductCard'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { ArrowLeft, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { normalizeImage } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'

// Generate metadata for the author page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ name: string; locale: string }>
}): Promise<Metadata> {
    const { name, locale } = await params
    const authorName = decodeURIComponent(name)

    return {
        title: `${authorName} - Livres et Biographie | SuperEcom`,
        description: `Découvrez tous les livres de ${authorName} disponibles sur SuperEcom. Achetez en ligne au Maroc avec livraison rapide.`,
        openGraph: {
            title: `${authorName} - Auteur sur SuperEcom`,
            description: `Les meilleurs livres de ${authorName} sélectionnés pour vous.`,
            type: 'profile',
            locale: locale === 'ar' ? 'ar_MA' : locale === 'en' ? 'en_MA' : 'fr_MA',
        },
    }
}

export default async function AuthorPage({
    params,
}: {
    params: Promise<{ name: string; locale: string }>
}) {
    const { name, locale } = await params
    const authorName = decodeURIComponent(name)
    const tAuthor = await getTranslations('AuthorsPage')
    const tBook = await getTranslations('BookDetail')
    const tCommon = await getTranslations('Common')

    const [products, authorProfile] = await Promise.all([
        getBooks({ author: authorName, active: true, limit: 100 }),
        getAuthorProfile(authorName)
    ])

    // Mock data for Eckhart Tolle if no profile found (temporary for demo)
    const profile = authorProfile || (authorName === 'Eckhart Tolle' ? {
        bio: "Eckhart Tolle is a spiritual teacher and best-selling author. He is a German-born resident of Canada best known as the author of The Power of Now and A New Earth. In 2008, The New York Times called Tolle 'the most popular spiritual author in the United States'.",
        image: "https://images.gr-assets.com/authors/1698205260p8/4298.jpg",
        nationality: "German / Canadian",
        birthYear: 1948
    } : null)

    if (!products || products.length === 0) {
        // Optionnel : rediriger ou afficher 404 si on veut être strict
        // notFound()
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
                    {/* Back Button */}
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-12 group transition-colors rtl:flex-row-reverse"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:translate-x-1" />
                        <span>{tBook('BackToSelection')}</span>
                    </Link>

                    {/* Author Header */}
                    <div className="bg-white rounded-[3rem] p-10 md:p-16 mb-20 shadow-xl shadow-black/5 border border-gray-100 relative overflow-hidden group">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            {!profile?.image && <User className="w-64 h-64 rtl:rotate-180" />}
                        </div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            {/* Author Info */}
                            <div className="lg:col-span-2">
                                <div className="inline-flex items-center gap-3 px-5 py-2 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-8">
                                    <User className="w-3 h-3" />
                                    <span>{tAuthor('AuthorLabel')}</span>
                                </div>

                                <h1 className="text-5xl md:text-8xl font-black text-black leading-none tracking-tighter mb-8">
                                    {authorName}<span className="text-gray-200">.</span>
                                </h1>

                                {profile?.nationality && (
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
                                        {profile.nationality} {profile.birthYear ? `• ${profile.birthYear}` : ''}
                                    </p>
                                )}

                                {profile?.bio && (
                                    <div className="prose prose-lg prose-headings:font-black prose-p:font-bold prose-p:text-gray-500 max-w-none mb-10">
                                        <p className="leading-relaxed">
                                            {profile.bio}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-gray-100 w-20"></div>
                                    <p className="text-lg font-black text-gray-400 uppercase tracking-widest">
                                        {tAuthor('BooksCount', { count: products.length })}
                                    </p>
                                </div>
                            </div>

                            {/* Author Image if available */}
                            {profile?.image && (
                                <div className="lg:col-span-1 flex justify-center lg:justify-end">
                                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-gray-100 shadow-2xl">
                                        <ImageWithFallback
                                            src={profile.image}
                                            alt={authorName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                            {products.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-xl font-bold text-gray-300 uppercase tracking-widest">
                                {tCommon('NoResultsDesc')}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
