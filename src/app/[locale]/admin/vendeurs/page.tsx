import { getSellerRequests } from '@/lib/actions/seller-requests'
import { Store } from 'lucide-react'
import SellerRequestsTable from './SellerRequestsTable'

export default async function AdminSellersPage() {
    const res = await getSellerRequests()
    const requests = res.success ? (res.requests ?? []) : []

    const pendingCount = requests.filter(r => r.status === 'PENDING').length

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Vendeurs<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Gestion des demandes de partenariat & Marketplace
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-blue-50/50 px-8 py-4 rounded-[1.5rem] border border-blue-100 shadow-sm transition-all hover:shadow-blue-200/20">
                    <Store className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 text-[11px] font-black uppercase tracking-widest">
                        {pendingCount} Demande(s) en attente
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <SellerRequestsTable initialRequests={requests as any[]} />
            </div>
        </div>
    )
}
