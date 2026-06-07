'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExchangeRequest } from '@/lib/actions/community-exchanges'
import { ArrowLeft, BookOpen, Loader2, Coins, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/routing'
import ReportButton from './ReportButton'
import { fbPixelEvents, fbCustomEvents } from '@/lib/facebook-pixel'

interface ExchangeFormProps {
    details: {
        product: any
        myBooks: any[]
        currentUser: any
        isEligible: boolean
    }
}

export default function ExchangeForm({ details }: ExchangeFormProps) {
    const t = useTranslations('Community.Exchange')
    const tc = useTranslations('Community')
    const tcmn = useTranslations('Common')
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // State
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const type = 'DIRECT'
    const [selectedBook, setSelectedBook] = useState<string>('')
    const [deliveryMethod, setDeliveryMethod] = useState<'MEETUP' | 'SHIPPING' | 'LOCKER'>('MEETUP')

    const { product, myBooks, currentUser, isEligible } = details



    const handleDeliveryChange = (newMethod: 'MEETUP' | 'SHIPPING' | 'LOCKER') => {
        startTransition(() => {
            setDeliveryMethod(newMethod)
        })
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await createExchangeRequest(formData)

        if (res.success) {
            fbPixelEvents.lead('ExchangeRequest')
            fbCustomEvents.exchangeInitiated(product.id)
            router.push('/community')
            router.refresh()
        } else {
            setError(res.error)
            setSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
            {/* Left: Product to Request - Side Panel Look */}
            <div className="lg:w-[35%] bg-black text-white p-12 flex flex-col items-center text-center relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pixio-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <Link href={`/community/market/${product.id}`} className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>

                <div className="relative mt-8 mb-10 group">
                    <div className="absolute inset-0 bg-pixio-yellow rounded-2xl rotate-6 scale-105 opacity-50 blur-sm group-hover:rotate-12 transition-transform"></div>
                    <div className="relative w-40 h-56 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20">
                        {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <BookOpen className="w-12 h-12 text-gray-700" />
                        )}
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <h2 className="text-2xl font-black tracking-tight leading-tight">{product.title}</h2>
                    <p className="text-lg font-medium text-gray-400 italic">{tcmn('By')} {product.author}</p>
                </div>

                <div className="mt-auto pt-10 border-t border-white/10 w-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4">{t('Subtitle')}</p>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-pixio-yellow text-black rounded-full flex items-center justify-center font-black text-lg border-2 border-white/20 shadow-lg">
                            {product.owner.fullName?.[0]}
                        </div>
                        <span className="font-black text-sm tracking-tight">{product.owner.fullName}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <ReportButton targetProductId={product.id} targetUserId={product.owner.id} />
                </div>
            </div>

            {/* Right: Offer Form - Clean & Spaced */}
            <div className="lg:w-[65%] p-12 lg:p-16 bg-white relative">
                <div className="max-w-xl mx-auto">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pixio-yellow/20 text-black border border-pixio-yellow/30 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t('NewExchange')}</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter uppercase">{t('Title')}</h1>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-10">
                        <input type="hidden" name="productRequestedId" value={product.id} />

                        <input type="hidden" name="type" value="DIRECT" />
                        
                        {/* Selected Product Offer */}
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                             <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-1">{t('SelectBook')}</label>

                                <div className="relative group/select">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <BookOpen className="w-4 h-4 text-black" />
                                    </div>
                                    <select
                                        name="productOfferedId"
                                        required
                                        value={selectedBook}
                                        onChange={(e) => setSelectedBook(e.target.value)}
                                        className="w-full pl-16 pr-8 py-5 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-black text-black appearance-none text-sm group-hover/select:bg-gray-100/50"
                                    >
                                        <option value="" disabled>{t('SelectPlaceholder')}</option>
                                        {myBooks.map((b: any) => (
                                            <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                                    </div>
                                </div>
                                {myBooks.length === 0 && (
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-3 bg-red-50 p-4 rounded-xl border border-red-100">
                                        {t('NoBooksAvailable')} <Link href="/community/products/new" className="underline text-black">{t('AddOneFirst')}</Link>
                                    </p>
                                )}
                            </div>


                        {/* Delivery Method Selector */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-1">{t('DeliveryMethods')}</label>
                            <div className="flex flex-wrap gap-3">
                                {['MEETUP', 'SHIPPING', 'LOCKER'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => handleDeliveryChange(m as any)}
                                        className={`px-6 py-3 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${deliveryMethod === m
                                            ? 'border-black bg-black text-white shadow-xl scale-105'
                                            : 'border-gray-100 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        {m === 'MEETUP' ? t('Meetup') : m === 'SHIPPING' ? t('Shipping') : t('Relay')}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" name="deliveryMethod" value={deliveryMethod} />
                        </div>

                        {/* Contextual Inputs based on Delivery */}
                        {deliveryMethod === 'MEETUP' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 animate-in zoom-in-95 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">{t('SuggestedMeetingPoint')}</label>
                                    <input
                                        name="meetingPoint"
                                        placeholder={t('MeetingPointPlaceholder')}
                                        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-black outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">{t('SuggestedMeetingTime')}</label>
                                    <input
                                        name="meetingDate"
                                        type="datetime-local"
                                        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-black outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-1">{t('Message')}</label>
                            <textarea
                                name="message"
                                rows={4}
                                className="w-full p-6 bg-gray-50/80 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black resize-none text-sm placeholder:text-gray-300"
                                placeholder={t('MessagePlaceholder')}
                            />
                        </div>

                        {error && (
                            <div className="p-6 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border-2 border-dashed border-red-200 animate-bounce">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !isEligible || !selectedBook}
                            className="group relative w-full h-20 bg-black text-white rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            <div className="absolute inset-0 bg-pixio-yellow translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <div className="relative flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.5em] group-hover:text-black transition-colors">
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        <span>{t('Submit')}</span>
                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                    </>
                                )}
                            </div>
                        </button>

                        {!isEligible && (
                            <p className="text-center text-[9px] font-black uppercase tracking-widest text-red-400 px-8">
                                {t('EligibilityNote')}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
