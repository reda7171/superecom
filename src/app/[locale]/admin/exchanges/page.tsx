import { getAllExchanges, getExchangeStats } from '@/lib/actions/admin-exchanges'
import Link from 'next/link'
import { PackageOpen, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import ExchangesTable from './ExchangesTable'

export default async function AdminExchangesPage() {
    const [exchanges, stats] = await Promise.all([
        getAllExchanges(),
        getExchangeStats()
    ])

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Échanges<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Communauté & Économie Circulaire
                    </p>
                </div>
                
                <Link
                    href="/admin/exchanges/create"
                    className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95 w-fit"
                >
                    <PackageOpen className="w-4 h-4" />
                    Nouvel Échange
                </Link>
            </div>

            {/* Stats Grid Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total", value: stats.total, color: "text-gray-400", icon: PackageOpen },
                    { label: "En attente", value: stats.pending, color: "text-yellow-500", icon: Clock },
                    { label: "Acceptés", value: stats.accepted, color: "text-blue-500", icon: AlertCircle },
                    { label: "Complétés", value: stats.completed, color: "text-emerald-500", icon: CheckCircle },
                    { label: "Annulés", value: stats.cancelled, color: "text-red-500", icon: XCircle }
                ].map((stat, i) => (
                    <div key={i} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-black/5 hover:-translate-y-1 transition-all relative overflow-hidden">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${stat.color}`}>{stat.label}</p>
                        <p className="text-4xl font-black text-black tracking-tighter">{stat.value}</p>
                        <stat.icon className={`absolute top-8 right-8 w-8 h-8 opacity-5 transition-transform group-hover:scale-125 ${stat.color}`} />
                    </div>
                ))}
            </div>

            {/* Table Container Premium */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <ExchangesTable exchanges={exchanges} />
            </div>
        </div>
    )
}
