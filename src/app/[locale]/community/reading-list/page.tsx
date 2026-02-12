import { getReadingList } from '@/lib/actions/reading-list'
import { getTranslations } from 'next-intl/server'
import ReadingListBoard from '@/components/ReadingListBoard'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'

export default async function ReadingListPage() {
    const t = await getTranslations('Community')
    const readingList = await getReadingList()

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black mb-2">Ma Liste de Lecture</h1>
                <p className="text-gray-500 mb-8">Suivez vos lectures et votre progression.</p>

                <div className="overflow-x-auto">
                    <div className="min-w-[1000px] pb-4">
                        <ReadingListBoard initialItems={readingList} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
