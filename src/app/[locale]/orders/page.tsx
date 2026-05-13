import { redirect } from 'next/navigation'
import { getOrders } from '@/lib/actions/orders'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { getTranslations } from 'next-intl/server'
import OrderList from '@/components/OrdersList'

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

                <OrderList orders={orders} locale={locale} />
            </main>
            <Footer />
        </div>
    )
}
