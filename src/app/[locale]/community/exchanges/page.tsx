import { getUserExchanges } from '@/lib/actions/community-exchanges'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { redirect } from 'next/navigation'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import ExchangesList from '@/components/community/ExchangesList'
import { Inbox, Send } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function ExchangesPage() {
    const user = await getCommunityUser()

    if (!user) {
        redirect('/community/login')
    }

    const { received, sent } = await getUserExchanges()
    const t = await getTranslations('Community.Exchanges')

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 w-full">
                <div className="mb-12">
                    <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter mb-4 uppercase">
                        {t('Title')}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {t('Subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Demandes Reçues */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                                <Inbox className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight">{t('Received')}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {t('Requests', { count: received.length })}
                                </p>
                            </div>
                        </div>
                        <ExchangesList exchanges={received} type="received" />
                    </div>

                    {/* Demandes Envoyées */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <Send className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight">{t('Sent')}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {t('Requests', { count: sent.length })}
                                </p>
                            </div>
                        </div>
                        <ExchangesList exchanges={sent} type="sent" />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
