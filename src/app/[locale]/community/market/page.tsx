import { getMarketBooks, getSmartMatches } from '@/lib/actions/community-market'
import { getCommunityUser, getUserOrderCount } from '@/lib/actions/community-auth'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import MarketClientSection from '@/components/community/MarketClientSection'
import { getTranslations } from 'next-intl/server'


export default async function MarketPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const city = typeof params.city === 'string' ? params.city : undefined
    const t = await getTranslations('Community.Market')

    const user = await getCommunityUser()
    const orderCount = await getUserOrderCount(user)
    const isBlurred = orderCount === 0

    // Si l'utilisateur n'a pas de commande, on force la recherche sur sa ville
    const effectiveCity = isBlurred ? (user?.city || city) : city

    const [books, smartMatches] = await Promise.all([
        getMarketBooks({ search, city: effectiveCity }),
        getSmartMatches()
    ])

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 w-full">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter mb-4 uppercase">
                        {t('Title')}
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto md:mx-0">
                        {t('Subtitle')}
                    </p>
                </div>

                <MarketClientSection
                    initialBooks={books}
                    smartMatches={smartMatches}
                    search={search}
                    city={effectiveCity}
                    isBlurred={isBlurred}
                />
            </main>

            <Footer />
        </div>
    )
}
