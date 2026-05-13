import { Suspense } from 'react'
import { getAllAds } from '@/lib/actions/advertisements'
import AdsList from '@/components/admin/AdsList'
import { Link } from '@/i18n/routing'
import { Plus } from 'lucide-react'

export default async function AdsPage() {
    const ads = await getAllAds()

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Publicités<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Gestion des espaces & Campagnes promotionnelles
                    </p>
                </div>

                <Link
                    href="/admin/ads/new"
                    className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle publicité
                </Link>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <Suspense fallback={
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Initialisation du flux publicitaire...</p>
                    </div>
                }>
                    <AdsList ads={ads} />
                </Suspense>
            </div>
        </div>
    )
}
