import { getGifts } from '@/lib/actions/gifts'
import GiftsTable from '@/components/admin/GiftsTable'
import GiftForm from '@/components/admin/GiftForm'
import { Gift } from 'lucide-react'

export default async function AdminGiftsPage() {
    const gifts = await getGifts()

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Gift className="w-8 h-8 text-indigo-600" />
                    Gestion des Cadeaux
                </h1>
                <p className="mt-2 text-sm text-gray-500 font-medium italic">
                    Configurez les cadeaux offerts lors des promotions pour l'affichage dans le checkout.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
                {/* Formulaire */}
                <div className="xl:col-span-1">
                    <GiftForm />
                </div>

                {/* Liste */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Cadeaux configurés</h2>
                    </div>
                    <GiftsTable gifts={gifts} />
                </div>
            </div>
        </div>
    )
}
