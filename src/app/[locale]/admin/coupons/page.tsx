import { getCoupons } from '@/lib/actions/coupons'
import CouponsTable from '@/components/admin/CouponsTable'
import CouponForm from '@/components/admin/CouponForm'
import { Ticket } from 'lucide-react'

export default async function AdminCouponsPage() {
    const coupons = await getCoupons()

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2">
                        Coupons<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Marketing & Fidélisation ({coupons.length} codes)
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10">
                        <Ticket className="w-4 h-4 text-blue-400" />
                        <span>Codes Promo Actifs</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Formulaire - En haut sur mobile, à gauche sur desktop (4/12) */}
                <div className="lg:col-span-4 lg:sticky lg:top-28">
                    <CouponForm />
                </div>

                {/* Liste - En bas sur mobile, à droite sur desktop (8/12) */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                        <h2 className="text-sm font-black text-black uppercase tracking-widest">Base de données Coupons</h2>
                    </div>
                    <CouponsTable coupons={coupons} />
                </div>
            </div>
        </div>
    )
}
