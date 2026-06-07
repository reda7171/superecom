'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { trackOrder, TrackingResult } from '@/lib/actions/tracking'
import { Search, Loader2, Package, CheckCircle2, Truck, XCircle, Clock } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'

export default function TrackingClient() {
    const t = useTranslations('Tracking')
    const params = useParams()
    const searchParams = useSearchParams()
    const locale = params.locale as string
    const [result, setResult] = useState<TrackingResult | null>(null)
    const [loading, setLoading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const orderIdParam = searchParams.get('orderId')
    const contactParam = searchParams.get('contact')

    useEffect(() => {
        if (orderIdParam && contactParam && formRef.current) {
            // Déclenchement automatique de la recherche
            const autoTrack = async () => {
                setLoading(true)
                const formData = new FormData()
                formData.append('orderId', orderIdParam)
                formData.append('contact', contactParam)
                const res = await trackOrder(formData)
                setResult(res)
                setLoading(false)
            }
            autoTrack()
        }
    }, [orderIdParam, contactParam])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await trackOrder(formData)
        setResult(res)
        setLoading(false)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-8 h-8 text-yellow-500" />
            case 'CONFIRMED': return <CheckCircle2 className="w-8 h-8 text-blue-500" />
            case 'SHIPPED': return <Truck className="w-8 h-8 text-purple-500" />
            case 'DELIVERED': return <Package className="w-8 h-8 text-green-500" />
            case 'CANCELLED': return <XCircle className="w-8 h-8 text-red-500" />
            default: return <Clock className="w-8 h-8 text-gray-500" />
        }
    }

    const steps = [
        { id: 'PENDING', icon: Clock },
        { id: 'CONFIRMED', icon: CheckCircle2 },
        { id: 'SHIPPED', icon: Truck },
        { id: 'DELIVERED', icon: Package },
    ]

    const getCurrentStepIndex = (status: string) => {
        if (status === 'CANCELLED') return -1
        return steps.findIndex(s => s.id === status)
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl shadow-black/5 border border-gray-100">
            <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('OrderId')}</label>
                        <input
                            name="orderId"
                            required
                            defaultValue={orderIdParam || ''}
                            placeholder="ex: 123e4567..."
                            className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Contact')}</label>
                        <input
                            name="contact"
                            required
                            defaultValue={contactParam || ''}
                            placeholder="Email ou 06..."
                            className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    {t('TrackButton')}
                </button>
            </form>

            {result && !result.success && (
                <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center font-bold animate-in fade-in slide-in-from-top-4">
                    {result.error}
                </div>
            )}

            {result && result.success && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-8">
                    <div className="border-t border-gray-100 pt-10">
                        <div className="flex flex-col items-center justify-center mb-10">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                {getStatusIcon(result.order.status)}
                            </div>
                            <h2 className="text-2xl font-black text-black uppercase tracking-tight">{t(`Steps.${result.order.status}`)}</h2>
                            <p className="text-gray-400 font-bold mt-2">
                                {new Date(result.order.createdAt).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                        </div>

                        {result.order.status !== 'CANCELLED' && (
                            <div className="relative flex justify-between items-center mb-12 px-4">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-black -z-10 rounded-full transition-all duration-1000"
                                    style={{ width: `${(getCurrentStepIndex(result.order.status) / (steps.length - 1)) * 100}%` }}
                                />
                                {steps.map((step, index) => {
                                    const isActive = index <= getCurrentStepIndex(result.order.status)
                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'bg-black border-black text-white scale-110' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-black' : 'text-gray-300'}`}>
                                                {t(`Steps.${step.id}`)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-200 pb-4">{t('Items')}</h3>
                            <ul className="space-y-4">
                                {result.order.items.map((item: any, idx: number) => {
                                    const title = item.product?.title || item.pack?.name || item.gift?.name || item.digitalProduct?.title || 'Produit inconnu'
                                    return (
                                        <li key={idx} className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-gray-800"><span className="text-black font-black mr-2">{item.quantity}x</span> {title}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('Total')}</span>
                                <span className="text-xl font-black text-black">{result.order.total} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
