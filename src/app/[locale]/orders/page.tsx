import { redirect } from 'next/navigation'
import { getOrders } from '@/lib/actions/orders'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Package, Calendar, MapPin, Phone, CreditCard } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function OrdersPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const orders = await getOrders()
    const t = await getTranslations('Orders')

    if (!orders) {
        redirect(`/${locale}/community/login`)
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 w-full">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-2">
                        {t('Title')}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        {t('Subtitle')}
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-gray-100">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-black mb-2">{t('EmptyTitle')}</h3>
                        <p className="text-gray-400 text-sm font-bold">
                            {t('EmptyDesc')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black text-black">
                                                {t('OrderNumber')}{order.id.slice(0, 8)}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {t(`Status.${order.status}`)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <p className="text-2xl font-black text-black">
                                            {order.total.toFixed(2)} DH
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-6">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {item.book?.image && (
                                                    <img
                                                        src={item.book.image}
                                                        alt={item.book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-black text-sm text-black">
                                                    {item.book?.title || item.pack?.name || 'Article'}
                                                </h4>
                                                <p className="text-xs text-gray-400 font-bold">
                                                    {t('Quantity')} {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-black text-sm text-black">
                                                {item.price.toFixed(2)} DH
                                            </p>
                                        </div>
                                    )) || (
                                            <p className="text-sm text-gray-400">Aucun article</p>
                                        )}
                                </div>

                                {/* Delivery Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                                {t('DeliveryAddress')}
                                            </p>
                                            <p className="text-sm font-bold text-black">
                                                {order.address}
                                            </p>
                                            <p className="text-xs text-gray-500 font-bold">
                                                {order.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                                {t('Contact')}
                                            </p>
                                            <p className="text-sm font-bold text-black">
                                                {order.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Tracking Info */}
                                {order.trackingID && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50/50 p-6 rounded-3xl space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-black p-3 rounded-2xl shadow-lg">
                                                    <Package className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                                                        {t('TrackingTitle')}
                                                    </p>
                                                    <p className="text-sm font-black text-black font-mono">
                                                        {order.trackingID}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://partners.olivraison.com/package/${order.trackingID}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white bg-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                                            >
                                                {t('TrackButton')}
                                            </a>
                                        </div>

                                        {order.deliveryStatus && (
                                            <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    <p className="text-xs font-black text-black uppercase tracking-tight">
                                                        {order.deliveryStatus}
                                                    </p>
                                                </div>
                                                {order.deliveryNotes && (
                                                    <p className="text-[11px] text-gray-500 font-medium italic pl-4">
                                                        "{order.deliveryNotes}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
