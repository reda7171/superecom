import { getTranslations } from 'next-intl/server'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import TrackingClient from './TrackingClient'

export default async function TrackingPage() {
    const t = await getTranslations('Tracking')

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-16 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-black text-black mb-4 tracking-tighter">{t('Title')}<span className="text-gray-300">.</span></h1>
                    <p className="text-gray-500 font-medium">{t('Subtitle')}</p>
                </div>

                <TrackingClient />
            </main>

            <Footer />
        </div>
    )
}
