import { Suspense } from 'react'
import { getAllAds } from '@/lib/actions/advertisements'
import AdsList from '@/components/admin/AdsList'
import { Link } from '@/i18n/routing'
import { Plus } from 'lucide-react'

export default async function AdsPage() {
    const ads = await getAllAds()

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-black">Publicités</h1>
                    <p className="text-gray-500 mt-2">Gérez les espaces publicitaires du site</p>
                </div>

                <Link
                    href="/admin/ads/new"
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Nouvelle publicité
                </Link>
            </div>

            <Suspense fallback={<div>Chargement...</div>}>
                <AdsList ads={ads} />
            </Suspense>
        </div>
    )
}
