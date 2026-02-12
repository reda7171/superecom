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
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Gestion des Échanges</h1>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Gérez les échanges de livres entre membres de la communauté Riwaya
                    </p>
                </div>
                <Link
                    href="/admin/exchanges/create"
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20"
                >
                    <PackageOpen className="w-4 h-4" />
                    Nouvel Échange
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                            <p className="mt-1 text-4xl font-black text-gray-900 tracking-tighter">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                            <PackageOpen className="w-6 h-6 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">En attente</p>
                            <p className="mt-1 text-4xl font-black text-gray-900 tracking-tighter">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Acceptés</p>
                            <p className="mt-1 text-4xl font-black text-gray-900 tracking-tighter">{stats.accepted}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Complétés</p>
                            <p className="mt-1 text-4xl font-black text-gray-900 tracking-tighter">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Annulés</p>
                            <p className="mt-1 text-4xl font-black text-gray-900 tracking-tighter">{stats.cancelled}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                <ExchangesTable exchanges={exchanges} />
            </div>
        </div>
    )
}
