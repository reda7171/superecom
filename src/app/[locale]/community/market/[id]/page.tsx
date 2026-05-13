import { getExchangeBookDetails } from '@/lib/actions/community-market'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { normalizeImage } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'
import { BookOpen, MapPin, Star, Calendar, RefreshCw, ArrowLeft, ShieldCheck, MessageCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default async function CommunityBookDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const book = await getExchangeBookDetails(id)
    const t = await getTranslations('Community')
    const tc = await getTranslations('Community.Market')
    const te = await getTranslations('Community.Exchange')
    const tCommon = await getTranslations('Common')

    if (!book) {
        redirect('/community/market')
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                {/* Navigation Back */}
                <Link
                    href="/community/market"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>{te('BackToMarket')}</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left: Book Cover Premium Look */}
                    <div className="lg:col-span-5 relative">
                        <div className="absolute inset-0 bg-pixio-yellow rounded-[3rem] rotate-3 -z-10 opacity-50 scale-105 blur-sm"></div>
                        <div className="relative aspect-[3/4] bg-white rounded-[2.5rem] shadow-2xl shadow-black/10 overflow-hidden border-2 border-black group">
                            {book.image ? (
                                <ImageWithFallback
                                    src={book.image}
                                    alt={book.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-pixio-yellow/20">
                                    <BookOpen className="w-24 h-24 text-pixio-yellow" />
                                </div>
                            )}

                            {/* Condition Badge Overlay */}
                            <div className="absolute top-8 right-8">
                                <span className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-xl">
                                    {t(`BookForm.Conditions.${book.condition}` as any)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Book & Owner Details */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Book Basic Info */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                                <RefreshCw className="w-3 h-3 text-pixio-yellow" />
                                <span>{book.exchangeType === 'DIRECT' ? te('BookToBook') : tc('Credits')}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.9]">
                                {book.title}<span className="text-pixio-yellow">.</span>
                            </h1>
                            <p className="text-2xl text-gray-400 font-bold italic">
                                {tCommon('By')} {book.author}
                            </p>
                        </div>

                        {/* Description */}
                        {book.description && (
                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pixio-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">{tc('DescriptionTitle')}</h3>
                                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                    {book.description}
                                </p>
                            </div>
                        )}

                        {/* Owner Info & CTA Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Owner Card */}
                            <div className="bg-black text-white rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-4 shadow-2xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>

                                <div className="relative w-24 h-24 rounded-full border-4 border-pixio-yellow overflow-hidden bg-gray-800 mb-2">
                                    {book.owner.image ? (
                                        <ImageWithFallback
                                            src={book.owner.image}
                                            alt={book.owner.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                                            {book.owner.fullName?.[0]}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xl font-black tracking-tight">{book.owner.fullName}</h4>
                                    <div className="flex items-center justify-center gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-pixio-yellow" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{book.owner.city}</span>
                                        </div>
                                        {book.owner.rating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-[10px] font-black">{book.owner.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 w-full">
                                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">{tc('MemberSince')}</div>
                                    <div className="text-xs font-bold">
                                        {new Date(book.owner.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Action */}
                            <div className="flex flex-col justify-between gap-6">
                                <div className="p-8 bg-pixio-yellow/20 rounded-[2.5rem] border border-pixio-yellow/30 flex items-start gap-4">
                                    <ShieldCheck className="w-8 h-8 text-black shrink-0" />
                                    <p className="text-xs font-black uppercase tracking-wider leading-relaxed">
                                        {tc('SecurityNotice')}
                                    </p>
                                </div>

                                <Link
                                    href={`/community/exchange/request/${book.id}`}
                                    className="w-full h-full min-h-[140px] bg-pixio-yellow rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:bg-black hover:text-white transition-all duration-500 shadow-xl shadow-pixio-yellow/20 hover:shadow-black/20"
                                >
                                    <RefreshCw className="w-10 h-10 mb-2 group-hover:rotate-180 transition-transform duration-700" />
                                    <span className="text-sm font-black uppercase tracking-[0.4em]">{tc('ExchangeButton')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
