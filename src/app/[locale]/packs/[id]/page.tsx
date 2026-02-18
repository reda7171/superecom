import { getPackById } from '@/lib/db/packs'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import BookCard from '@/components/BookCard'
import AddToCartButton from '@/components/AddToCartButton'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Check, Package, Shield, Sparkles, Truck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import SetPixelView from '@/components/SetPixelView'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
    const { id, locale } = await params
    const pack = await getPackById(id)

    if (!pack) {
        return {
            title: 'Pack introuvable | Riwaya',
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'
    const imageUrl = pack.image?.startsWith('http') ? pack.image : (pack.books[0]?.book.image || '')

    const totalOriginalPrice = pack.books.reduce((sum, pb) => sum + pb.book.price, 0)
    const savings = totalOriginalPrice - pack.price
    const savingsPercent = Math.round((savings / totalOriginalPrice) * 100)

    const bookTitles = pack.books.map(pb => pb.book.title).join(', ')

    const keywords = [
        pack.name,
        `pack ${pack.name}`,
        'pack de livres maroc',
        'packs livres',
        'livres en promotion maroc',
        `économiser ${savingsPercent}%`,
        ...pack.books.map(pb => pb.book.title),
        ...pack.books.map(pb => pb.book.author),
        'librairie en ligne maroc',
    ]

    return {
        title: `${pack.name} - Pack de ${pack.books.length} Livres | Riwaya`,
        description: `Achetez le pack "${pack.name}" sur Riwaya. ${pack.books.length} livres sélectionnés : ${bookTitles.slice(0, 100)}... Économisez ${savingsPercent}% (${savings} MAD). Prix: ${pack.price} MAD. Livraison rapide au Maroc.`,
        keywords,
        openGraph: {
            title: `${pack.name} - Économisez ${savingsPercent}%`,
            description: pack.description?.slice(0, 160) || `Pack de ${pack.books.length} livres sélectionnés. ${savings} MAD d'économie.`,
            images: imageUrl ? [imageUrl] : [],
            type: 'website',
            locale: locale === 'ar' ? 'ar_MA' : locale === 'en' ? 'en_MA' : 'fr_MA',
            url: `${baseUrl}/${locale}/packs/${pack.id}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${pack.name} - ${savingsPercent}% de réduction`,
            description: `Pack de ${pack.books.length} livres à ${pack.price} MAD au lieu de ${totalOriginalPrice} MAD`,
            images: imageUrl ? [imageUrl] : [],
        },
        alternates: {
            canonical: `/${locale}/packs/${pack.id}`,
            languages: {
                'fr': `/fr/packs/${pack.id}`,
                'ar': `/ar/packs/${pack.id}`,
                'en': `/en/packs/${pack.id}`,
            },
        },
    }
}

export default async function PackDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const pack = await getPackById(id)
    const t = await getTranslations('PackDetail')
    const tPacks = await getTranslations('Packs')
    const tNav = await getTranslations('Navigation')

    if (!pack) {
        notFound()
    }

    const totalOriginalPrice = pack.books.reduce((sum, pb) => sum + pb.book.price, 0)
    const savings = totalOriginalPrice - pack.price
    const savingsPercent = Math.round((savings / totalOriginalPrice) * 100)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.com'
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'ProductGroup',
            name: pack.name,
            description: pack.description || `Pack de ${pack.books.length} livres sélectionné par Riwaya.`,
            image: pack.image || pack.books[0]?.book.image,
            brand: {
                '@type': 'Organization',
                name: 'Riwaya',
            },
            offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'MAD',
                lowPrice: pack.price,
                highPrice: totalOriginalPrice,
                offerCount: 1,
                availability: 'https://schema.org/InStock',
                url: `${baseUrl}/packs/${pack.id}`,
            },
            hasVariant: pack.books.map((pb) => ({
                '@type': 'Book',
                name: pb.book.title,
                author: {
                    '@type': 'Person',
                    name: pb.book.author,
                },
                image: pb.book.image,
                isbn: pb.book.isbn,
            })),
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
                    name: 'Packs',
                    item: `${baseUrl}/packs`
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: pack.name,
                    item: `${baseUrl}/packs/${pack.id}`
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
                    id={pack.id}
                    title={pack.name}
                    price={pack.price}
                    category="Packs"
                />
                <Header />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-12">
                        <Link href="/" className="hover:text-black transition-colors">{tNav('Home')}</Link>
                        <span className="text-gray-200">/</span>
                        <Link href="/packs" className="hover:text-black transition-colors">{tNav('Packs')}</Link>
                        <span className="text-gray-200">/</span>
                        <span className="text-black">{pack.name}</span>
                    </div>

                    <Link
                        href="/packs"
                        className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-12 group transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        <span>{t('BackToBundles')}</span>
                    </Link>

                    {/* Hero Pack */}
                    <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 mb-32">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Image Section */}
                            <div className="bg-pixio-beige p-12 flex items-center justify-center relative min-h-[500px]">
                                <div className="absolute top-10 right-10 z-10">
                                    <div className="bg-black text-white px-8 py-8 rounded-[2rem] shadow-2xl transform rotate-6 flex flex-col items-center justify-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">{tPacks('Save')}</p>
                                        <p className="text-4xl font-black leading-none tracking-tighter">{savingsPercent}%</p>
                                    </div>
                                </div>

                                {pack.image ? (
                                    <div className="relative w-full h-full min-h-[400px] group">
                                        <Image
                                            src={pack.image}
                                            alt={pack.name}
                                            fill
                                            className="object-contain transition-transform duration-700 group-hover:scale-105"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                                        {pack.books.slice(0, 4).map((pb, i) => (
                                            <div key={pb.book.id} className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105 transform ${i % 2 === 0 ? '-rotate-3 mt-6' : 'rotate-3 mb-6'}`}>
                                                <Image
                                                    src={pb.book.image}
                                                    alt={pb.book.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-12 lg:p-20 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 w-fit">
                                    <Package className="w-4 h-4" />
                                    {t('VolumeSelection', { count: pack.books.length })}
                                </div>

                                <h1 className="text-5xl md:text-7xl font-black text-black leading-none tracking-tighter mb-10">
                                    {pack.name}<span className="text-gray-200">.</span>
                                </h1>

                                {/* Price Block */}
                                <div className="bg-pixio-cream/50 rounded-[2.5rem] p-10 mb-12 border border-gray-50">
                                    <div className="flex items-center gap-6 mb-4">
                                        <span className="text-gray-300 text-xl line-through font-black tracking-tighter">
                                            {totalOriginalPrice} MAD
                                        </span>
                                        <span className="text-black font-black bg-pixio-yellow px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest">
                                            {t('SavingsOff', { amount: savings })}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-7xl font-black text-black tracking-tighter leading-none">{pack.price}</span>
                                        <span className="text-2xl text-gray-300 font-black uppercase tracking-widest">MAD</span>
                                    </div>
                                </div>

                                <div className="mb-12">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-8 flex items-center gap-4">
                                        <Sparkles className="w-4 h-4 text-black" />
                                        {t('BundleContent')}
                                    </h3>
                                    <ul className="space-y-4">
                                        {pack.books.map((pb) => (
                                            <li key={pb.book.id} className="flex items-start gap-4">
                                                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">{pb.book.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <AddToCartButton
                                    product={{
                                        id: pack.id,
                                        title: pack.name,
                                        price: pack.price,
                                        image: pack.image || pack.books[0]?.book.image || '',
                                        type: 'PACK'
                                    }}
                                    className="!py-8 text-xs font-black uppercase tracking-[0.3em] !rounded-full shadow-2xl hover:shadow-black/20"
                                />

                                <div className="flex items-center justify-center gap-10 mt-10">
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300">
                                        <Truck className="w-4 h-4" />
                                        {t('GlobalShip')}
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300">
                                        <Shield className="w-4 h-4" />
                                        {t('SecureCOD')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Books Details */}
                    <section>
                        <div className="flex items-center justify-between mb-20 px-4">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-black text-white rounded-[1.5rem] flex items-center justify-center text-4xl font-black tracking-tighter">
                                    {pack.books.length}
                                </div>
                                <h2 className="text-4xl font-black text-black tracking-tighter leading-none">{t('VolumesInCollection')}<span className="text-gray-200">.</span></h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {pack.books.map((pb) => (
                                <BookCard key={pb.book.id} {...pb.book} />
                            ))}
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        </>
    )
}
