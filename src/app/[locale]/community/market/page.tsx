import { getMarketBooks } from '@/lib/actions/community-market'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import MarketBookCard from '@/components/community/MarketBookCard'
import MarketFiltersClient from '@/components/community/MarketFiltersClient'
import { BookOpen, Frown } from 'lucide-react'

export default async function MarketPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const city = typeof params.city === 'string' ? params.city : undefined

    const books = await getMarketBooks({ search, city })

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 w-full">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter mb-4 uppercase">
                        La Bibliothèque Commune
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto md:mx-0">
                        Explorez les livres disponibles à l'échange près de chez vous. Proposez un échange direct ou utilisez vos crédits.
                    </p>
                </div>

                {/* Filters */}
                <MarketFiltersClient />

                {/* Grid */}
                {books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {books.map((book) => (
                            <MarketBookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-dashed border-2 border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Frown className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-black mb-2">Aucun livre trouvé</h2>
                        <p className="text-gray-400 font-medium max-w-md text-center">
                            Essayez de modifier vos filtres ou revenez plus tard. De nouveaux livres sont ajoutés régulièrement par la communauté.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
