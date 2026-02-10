'use client'

import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import { useRouter } from '@/i18n/routing'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createOrder } from '@/lib/actions/orders'
import { ArrowLeft, CheckCircle, Package, Truck, Wallet, Ticket, Loader2, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import CouponInput from '@/components/CouponInput'
import { useTranslations } from 'next-intl'
import { MOROCCO_CITIES } from '@/lib/constants/cities'
import { useUIStore } from '@/store/ui'

interface CheckoutForm {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    comment?: string
}

export default function CheckoutClient({ user }: { user?: { fullName?: string | null; email: string; image?: string | null } | null }) {
    const router = useRouter()
    const { items, getTotalPrice, clearCart } = useCartStore()
    const { showNotification } = useUIStore()
    const [mounted, setMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [coupon, setCoupon] = useState<any>(null)
    const t = useTranslations('Checkout')

    // Pré-remplir le formulaire si l'utilisateur est connecté
    const defaultValues: Partial<CheckoutForm> = user ? {
        email: user.email,
        firstName: user.fullName?.split(' ')[0] || '',
        lastName: user.fullName?.split(' ').slice(1).join(' ') || ''
    } : {}

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
        defaultValues
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && items.length === 0) {
            router.replace('/cart')
        }
    }, [mounted, items.length, router])

    if (!mounted) return null

    if (items.length === 0) {
        return null
    }

    const subtotal = getTotalPrice()
    const shippingFee = subtotal >= 500 ? 0 : 30

    let discountAmount = 0
    if (coupon) {
        if (coupon.type === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discount) / 100
        } else {
            discountAmount = coupon.discount
        }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee)

    const onSubmit = async (data: CheckoutForm) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                type: item.type,
                price: item.price
            }))

            const result = await createOrder({
                fullName: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                comment: data.comment,
                items: orderItems,
                couponCode: coupon?.code,
            })

            if (result.success) {
                clearCart()
                showNotification(t('OrderSuccess'), 'success')
                router.push(`/checkout/success/${result.orderId}`)
            } else {
                setError(result.error || "Une erreur est survenue")
                showNotification(result.error || t('Errors.UnexpectedError'), 'error')
            }
        } catch (e: any) {
            setError(e.message || t('Errors.UnexpectedError'))
            showNotification(e.message || t('Errors.UnexpectedError'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Link
                href="/"
                className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-12 transition-colors group rtl:flex-row-reverse"
            >
                <ArrowLeft className="w-3 h-3 mr-2 transition-transform group-hover:-translate-x-1 rtl:ml-2 rtl:mr-0 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                {t('BackToSelection')}
            </Link>

            <h1 className="text-5xl font-black text-black mb-16 tracking-tighter">{t('YourDetails')}<span className="text-gray-200">.</span></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Formulaire Principal */}
                <div className="lg:col-span-2 space-y-12">
                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-black mb-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-sm shadow-xl">01</div>
                                {t('ShippingInfo')}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('FirstName')}</label>
                                    <input
                                        {...register('firstName', { required: t('Errors.FirstNameRequired') })}
                                        className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                                    />
                                    {errors.firstName && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('LastName')}</label>
                                    <input
                                        {...register('lastName', { required: t('Errors.LastNameRequired') })}
                                        className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                                    />
                                    {errors.lastName && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Email')}</label>
                                <input
                                    {...register('email', {
                                        required: t('Errors.EmailRequired'),
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: t('Errors.EmailInvalid')
                                        }
                                    })}
                                    className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                                />
                                {errors.email && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-3 mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('MobileNumber')}</label>
                                <input
                                    {...register('phone', {
                                        required: t('Errors.PhoneRequired'),
                                        pattern: {
                                            value: /^(06|07|05)[0-9]{8}$/,
                                            message: t('Errors.PhoneInvalid')
                                        }
                                    })}
                                    className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                                />
                                {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.phone.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('City')}</label>
                                    <div className="relative">
                                        <select
                                            {...register('city', { required: t('Errors.CityRequired') })}
                                            className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black appearance-none"
                                        >
                                            <option value="">{t('ChooseCity')}</option>
                                            {MOROCCO_CITIES.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-6 rtl:right-auto">
                                            <div className="w-2 h-2 border-r-2 border-b-2 border-black rotate-45"></div>
                                        </div>
                                    </div>
                                    {errors.city && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.city.message}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('FullAddress')}</label>
                                    <input
                                        {...register('address', { required: t('Errors.AddressRequired') })}
                                        className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black"
                                    />
                                    {errors.address && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.address.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('NoteOptional')}</label>
                                <textarea
                                    {...register('comment')}
                                    className="w-full px-6 py-5 bg-pixio-cream/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-black text-black min-h-[120px]"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-black mb-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-sm shadow-xl">02</div>
                                {t('PaymentMethod')}
                            </h2>

                            <div className="relative">
                                <div className="p-8 bg-pixio-cream/30 border-2 border-black rounded-[2rem] flex items-center gap-8 shadow-2xl shadow-black/5">
                                    <div className="w-16 h-16 bg-white border border-gray-100 text-black rounded-2xl flex items-center justify-center shrink-0">
                                        <Wallet className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-black text-black text-xl tracking-tight">{t('CashOnDelivery')}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t('PayWhenReceive')}</p>
                                    </div>
                                    <div className="ml-auto rtl:mr-auto rtl:ml-0">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Résumé Panier & Code Promo */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 sticky top-24 space-y-10">
                        <div>
                            <h2 className="text-xl font-black text-black tracking-tight mb-8">{t('SelectionSummary')}</h2>
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-5 group">
                                        <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-pixio-cream shrink-0 border border-gray-50 group-hover:scale-105 transition-transform">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-7 h-7 bg-black text-white text-[10px] font-black rounded-xl flex items-center justify-center shadow-2xl">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 py-1">
                                            <p className="text-sm font-black text-black line-clamp-2 leading-tight tracking-tight">{item.title}</p>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">{item.price} MAD</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section Coupon */}
                        <div className="pt-10 border-t border-gray-50">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">{t('PromotionalCode')}</p>
                            <CouponInput
                                cartTotal={subtotal}
                                onApplied={setCoupon}
                                onRemoved={() => setCoupon(null)}
                            />
                        </div>

                        {/* Totaux */}
                        <div className="space-y-5 pt-10 border-t border-gray-50">
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-400">
                                <span>{t('SelectionSummary')}</span>
                                <span className="text-black">{subtotal.toFixed(0)} MAD</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-pixio-pink bg-black px-4 py-3 rounded-2xl">
                                    <span className="flex items-center gap-2">
                                        <Ticket className="w-4 h-4" /> {t('CodeApplied')}
                                    </span>
                                    <span>-{discountAmount.toFixed(0)} MAD</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-400">
                                <span>{t('DeliveryFee')}</span>
                                {shippingFee === 0 ? (
                                    <span className="text-black bg-pixio-yellow px-2 py-1 rounded-md">{t('Free')}</span>
                                ) : (
                                    <span className="text-black">{shippingFee} MAD</span>
                                )}
                            </div>
                            <div className="pt-6 border-t border-gray-50">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{t('TotalAmount')}</p>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-4xl font-black text-black tracking-tighter leading-none">{finalTotal.toFixed(0)}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MAD</p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-5 bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-center shadow-2xl">
                                {error}
                            </div>
                        )}

                        <button
                            form="checkout-form"
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white font-black py-6 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('Processing')}
                                </>
                            ) : (
                                <>
                                    {t('CompletePurchase')}
                                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-4 p-5 bg-pixio-cream/50 rounded-[1.5rem] border border-gray-50">
                            <Truck className="w-5 h-5 text-black" />
                            <p className="text-[9px] font-black text-black/40 uppercase tracking-widest leading-loose" dangerouslySetInnerHTML={{ __html: t.raw('FastDelivery') }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
