import { getReadingList } from '@/lib/actions/reading-list'
import { getTranslations } from 'next-intl/server'
import ReadingListBoard from '@/components/ReadingListBoard'
import AddManualBookReadingList from '@/components/AddManualBookReadingList'
import ReadingListStats from '@/components/ReadingListStats'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { isFeatureEnabled } from '@/lib/actions/site-settings'
import { notFound } from 'next/navigation'

export default async function ReadingListPage() {
    // Guard: vérifier si le Suivi de Lecture est activé
    const enabled = await isFeatureEnabled('feature_reading_list')
    if (!enabled) notFound()

    const t = await getTranslations('Community')
    const readingList = await getReadingList()

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black mb-2 text-black">{t('ReadingList.Title')}</h1>
                <p className="text-gray-500 mb-8 font-medium">{t('ReadingList.Subtitle')}</p>

                <ReadingListStats items={readingList} />

                <AddManualBookReadingList />

                <ReadingListBoard initialItems={readingList} />
            </div>
            <Footer />
        </div>
    )
}
