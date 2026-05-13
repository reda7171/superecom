'use client'

import { useState } from 'react'
import OrderFilters from './OrderFilters'
import OrdersTableClient from './OrdersTableClient'
import ImportOrdersButton from '@/components/admin/ImportOrdersButton'
import ExportOrdersButton from '@/components/admin/ExportOrdersButton'

interface OrdersPageClientProps {
    orders: any[]
    locale: string
    statusColors: any
    statusLabels: any
    currentStatus?: string
    stats: {
        totalArticles: number
        totalRevenue: number
        totalNetProfit: number
    }
}

export default function OrdersPageClient({
    orders,
    locale,
    statusColors,
    statusLabels,
    currentStatus,
    stats
}: OrdersPageClientProps) {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Commandes</h1>
                <div className="flex items-center gap-3">
                    <ImportOrdersButton />
                    <ExportOrdersButton orders={orders} />
                </div>
            </div>

            {/* Statistiques (Cartes) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Articles (Ventes)</p>
                    <p className="text-2xl font-black text-gray-900 mt-2">{stats.totalArticles}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total (CA)</p>
                    <p className="text-2xl font-black text-blue-600 mt-2">{stats.totalRevenue.toFixed(2)} MAD</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Marge Nette (Est.)</p>
                    <p className={`text-2xl font-black mt-2 ${stats.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.totalNetProfit > 0 ? '+' : ''}{stats.totalNetProfit.toFixed(2)} MAD
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Search & Filters */}
                <OrderFilters 
                    locale={locale}
                    statusLabels={statusLabels}
                    currentStatus={currentStatus}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    totalCount={orders.length}
                />

                {/* Table Content */}
                <div className="w-full">
                    <OrdersTableClient
                        orders={orders}
                        locale={locale}
                        statusColors={statusColors}
                        statusLabels={statusLabels}
                        searchTerm={searchTerm}
                    />
                </div>
            </div>
        </div>
    )
}
