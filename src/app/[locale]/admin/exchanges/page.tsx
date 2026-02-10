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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Échanges</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Gérez les échanges de livres entre membres de la communauté
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <PackageOpen className="w-10 h-10 text-gray-400" />
                    </div>
                </div>

                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-600">En attente</p>
                            <p className="mt-2 text-3xl font-bold text-yellow-900">{stats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">Acceptés</p>
                            <p className="mt-2 text-3xl font-bold text-blue-900">{stats.accepted}</p>
                        </div>
                        <AlertCircle className="w-10 h-10 text-blue-400" />
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600">Complétés</p>
                            <p className="mt-2 text-3xl font-bold text-green-900">{stats.completed}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                </div>

                <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Annulés</p>
                            <p className="mt-2 text-3xl font-bold text-red-900">{stats.cancelled}</p>
                        </div>
                        <XCircle className="w-10 h-10 text-red-400" />
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
