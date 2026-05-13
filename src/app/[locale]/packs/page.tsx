import { getPacks } from '@/lib/db/packs'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import PackCard from '@/components/PackCard'
import { Package, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Link } from '@/i18n/routing'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('PacksPage')

    return {
        title: `${t('Title')} | Riwaya`,
        description: t('Subtitle'),
    }
}

export const dynamic = 'force-dynamic'

export default async function PacksPage() {
    const packs = await getPacks()
    const t = await getTranslations('PacksPage')
    const tNav = await getTranslations('Navigation')

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            {/* Page Header */}
            <div className="bg-pixio-beige pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-black">
                    {/* Breadcrumbs */}
                    <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
                        <Link href="/" className="hover:text-black transition-colors">{tNav('Home')}</Link>
                        <span className="text-gray-200">/</span>
                        <span className="text-black">{t('Title')}</span>
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter">
                        {t('Title')}<span className="text-gray-300">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.25em] text-[10px] max-w-xl mx-auto leading-loose">
                        {t('Subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                {packs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-pixio-cream rounded-full flex items-center justify-center mx-auto mb-8">
                            <Package className="w-10 h-10 text-black/10" />
                        </div>
                        <h3 className="text-2xl font-black text-black mb-4">{t('NoCollections')}</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t('Curating')}</p>
                    </div>
                ) : (
                    <>
                        {/* Benefits Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-beige rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-2xl font-black text-black tracking-tighter">%</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Benefits.HighSavings.Title')}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{t('Benefits.HighSavings.Desc')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-pink rounded-full flex items-center justify-center shrink-0">
                                    <Sparkles className="w-8 h-8 text-black" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Benefits.CuratedMix.Title')}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{t('Benefits.CuratedMix.Desc')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-yellow rounded-full flex items-center justify-center shrink-0">
                                    <Package className="w-8 h-8 text-black" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black">{t('Benefits.ExpressPack.Title')}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">{t('Benefits.ExpressPack.Desc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {packs.map((pack) => (
                                <PackCard
                                    key={pack.id}
                                    {...pack}
                                    books={pack.books.map(pb => ({
                                        book: {
                                            ...pb.book,
                                            price: pb.book.price
                                        }
                                    }))}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}
