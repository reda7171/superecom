import { getBooks, getBookCategories, getBooksCount, getAllAuthors } from '@/lib/db/books'
import { getCategoryConfigByName } from '@/lib/actions/categories'
import { getSetting } from '@/lib/actions/site-settings'
import { parsePriceFilter } from '@/lib/utils/search'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import BookCard from '@/components/BookCard'
import InfiniteBookList from '@/components/InfiniteBookList'
import BooksFilters from '@/components/BooksFilters'
import { Filter, SlidersHorizontal, Quote, Banknote, Globe, User } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { sendTelegramMessage } from '@/lib/telegram'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
    const params = await searchParams
    const tCommon = await getTranslations('Common')
    const tCats = await getTranslations('Categories')
    const tBooksPage = await getTranslations('BooksPage')

    const categoryName = params.category ? (tCats.has(params.category as any) ? String(tCats(params.category as any)) : params.category) : null
    const title = categoryName ? `${categoryName} | Riwaya` : String(tBooksPage('Title')) + ' | Riwaya'

    return {
        title,
        description: `Explorez notre collection de livres ${categoryName ? `en ${categoryName}` : 'de développement personnel et business'} sur Riwaya. Livraison disponible dans tout le Maroc.`,
    }
}

interface SearchParams {
    category?: string
    search?: string
    language?: string
    inStock?: string
}

export default async function BooksPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const tCommon = await getTranslations('Common');
    const tCats = await getTranslations('Categories');
    const tBooksPage = await getTranslations('BooksPage');
    const tNav = await getTranslations('Navigation');

    // Envoyer une notification Telegram de manière asynchrone
    try {
        const { getSetting } = await import('@/lib/actions/site-settings')
        const { getCommunityUser } = await import('@/lib/actions/community-auth')
        const { getAdminUser } = await import('@/lib/actions/auth')
        const { prisma } = await import('@/lib/prisma')
        
        const shouldNotify = await getSetting('telegram_notify_search') === 'true'

        if (shouldNotify) {
            // Identifier l'utilisateur
            const communityUser = await getCommunityUser()
            const adminUserId = await getAdminUser()
            
            let visitorName = 'Client'
            if (adminUserId) {
                const admin = await prisma.user.findUnique({ 
                    where: { id: adminUserId }, 
                    select: { fullName: true } 
                })
                visitorName = admin?.fullName || 'Admin'
            } else if (communityUser) {
                visitorName = communityUser.fullName || 'Client'
            }

            if (params.search || params.category || params.language) {
                const safeSearch = (params.search || '---').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const safeCat = (params.category || 'Toutes').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const msg = params.search 
                    ? `🔍 <b>Nouvelle Recherche</b> - ${visitorName}\n\n🔎 <b>Terme:</b> ${safeSearch}\n📁 <b>Catégorie:</b> ${safeCat}\n🌐 <b>Langue:</b> ${params.language || 'Toutes'}`
                    : `📂 <b>Filtrage Catalogue</b> - ${visitorName}\n\n📁 <b>Catégorie:</b> ${safeCat}\n🌐 <b>Langue:</b> ${params.language || 'Toutes'}`;
                
                sendTelegramMessage(msg).catch(console.error);
            } else {
                sendTelegramMessage(`👀 <b>Visite Catalogue</b> - ${visitorName}\n\nUn visiteur parcourt tous les livres.`).catch(console.error);
            }
        }
    } catch (e) {
        // Ignorer
    }

    // Parser le prix dans la recherche si elle existe
    const priceFilter = params.search ? parsePriceFilter(params.search) : { minPrice: undefined, maxPrice: undefined, cleanQuery: params.search };

    const filterObj = {
        category: params.category,
        search: priceFilter.cleanQuery,
        minPrice: priceFilter.minPrice,
        maxPrice: priceFilter.maxPrice,
        active: true,
        language: params.language,
        inStock: params.inStock === undefined ? true : params.inStock === 'true',
    };

    const [books, totalCount, categories, categoryConfig, authors, adsenseEnabled, adsensePublisherId, adsenseSlotBetweenBooks] = await Promise.all([
        getBooks(filterObj),
        getBooksCount(filterObj),
        getBookCategories(),
        params.category ? getCategoryConfigByName(params.category) : null,
        getAllAuthors(),
        getSetting('adsense_enabled'),
        getSetting('adsense_publisher_id'),
        getSetting('adsense_slot_between_books')
    ])

    const languages = [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' },
        { code: 'ar', label: 'العربية' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-10 mt-12 lg:mt-10">
                <div className="flex flex-col lg:flex-row gap-4 xl:gap-6">
                    {/* Sidebar / Mobile Sticky Filters */}
                    <BooksFilters 
                        params={params}
                        categories={categories}
                        authors={authors}
                        languages={languages}
                        totalCount={totalCount}
                    />


                    {/* Books Grid */}
                    <div className="flex-1">
                        {books.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100">
                                <div className="w-24 h-24 bg-pixio-cream rounded-full flex items-center justify-center mx-auto mb-10">
                                    <Filter className="w-10 h-10 text-black/10" />
                                </div>
                                <h3 className="text-2xl font-black text-black mb-4">{tBooksPage('NoVolumes')}</h3>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">
                                    {tBooksPage('EmptyCollection')}
                                </p>
                                <Link
                                    href="/books"
                                    className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-800 transition-all shadow-2xl"
                                >
                                    {tBooksPage('EmptyFilters')}
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Results Header */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                            <span className="text-gray-900 font-black">{totalCount}</span> {tBooksPage('Results')}
                                        </p>
                                    </div>
                                </div>

                                {/* Grid with Infinite Scroll */}
                                <InfiniteBookList
                                    initialBooks={books}
                                    initialFilters={{
                                        category: params.category,
                                        search: priceFilter.cleanQuery,
                                        minPrice: priceFilter.minPrice,
                                        maxPrice: priceFilter.maxPrice,
                                        active: true,
                                        language: params.language,
                                        inStock: params.inStock === undefined ? true : params.inStock === 'true',
                                        page: 1,
                                        limit: 12
                                    }}
                                    adsense={{
                                        enabled: adsenseEnabled === 'true',
                                        publisherId: adsensePublisherId || '',
                                        slotId: adsenseSlotBetweenBooks || ''
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
