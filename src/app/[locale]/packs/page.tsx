import { getPacks } from '@/lib/db/packs'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { prisma } from '@/lib/prisma'
import PacksListClient from '@/components/packs/PacksListClient'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Link } from '@/i18n/routing'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('PacksPage')

    return {
        title: `${t('Title')} | SuperEcom`,
        description: t('Subtitle'),
    }
}


export const dynamic = 'force-dynamic'

export default async function PacksPage() {
    const packs = await getPacks()
    const availableBooks = await prisma.product.findMany({
        where: {
            active: true,
            stock: { gt: 0 }
        },
        orderBy: {
            title: 'asc'
        }
    })

    const t = await getTranslations('PacksPage')
    const tNav = await getTranslations('Navigation')

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            {/* Page Header */}
            <div className="bg-pixio-beige pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-black">
                    {/* Breadcrumbs */}
                    <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
                        <Link href="/" className="hover:text-black transition-colors">{tNav('Home')}</Link>
                        <span className="text-gray-200">/</span>
                        <span className="text-black">{t('Title')}</span>
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter">
                        {t('Title')}<span className="text-gray-300">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.25em] text-[10px] max-w-xl mx-auto leading-loose">
                        {t('Subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                <PacksListClient packs={packs} availableBooks={availableBooks} />
            </div>
            <Footer />
        </div>
    )
}
