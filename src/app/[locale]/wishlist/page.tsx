import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import WishlistContent from '@/components/WishlistContent'
import { getTranslations } from 'next-intl/server'
import { getCommunityUser } from '@/lib/actions/community-auth'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Wishlist' })

    return {
        title: t('seo.Title'),
        description: t('seo.Description'),
        robots: {
            index: false,
            follow: true,
        },
        openGraph: {
            title: t('seo.Title'),
            description: t('seo.Description'),
            type: 'website',
        }
    }
}

export default async function WishlistPage() {
    const user = await getCommunityUser()

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-grow">
                <WishlistContent isAuthenticated={!!user} />
            </main>
            <Footer />
        </div>
    )
}
