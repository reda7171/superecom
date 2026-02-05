import { getCoupons } from '@/lib/actions/coupons'
import CouponsTable from '@/components/admin/CouponsTable'
import CouponForm from '@/components/admin/CouponForm'
import { Ticket } from 'lucide-react'

export default async function AdminCouponsPage() {
    const coupons = await getCoupons()

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Ticket className="w-8 h-8 text-blue-600" />
                    Gestion des Codes Promo
                </h1>
                <p className="mt-2 text-sm text-gray-500 font-medium italic">
                    Créez des remises exclusives pour booster vos ventes Riwaya.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
                {/* Formulaire */}
                <div className="xl:col-span-1">
                    <CouponForm />
                </div>

                {/* Liste */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Liste des Coupons</h2>
                    </div>
                    <CouponsTable coupons={coupons} />
                </div>
            </div>
        </div>
    )
}
