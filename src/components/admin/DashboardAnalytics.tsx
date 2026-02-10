'use client'

import { useEffect, useState } from 'react'
import { getDashboardAnalytics } from '@/lib/actions/analytics'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { AlertTriangle, TrendingUp, Package, Star, FileText } from 'lucide-react'
import Image from 'next/image'
import ExportButton from './ExportButton'
import { exportSalesReport } from '@/lib/actions/export'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088fe', '#00c49f', '#ff8042']

export default function DashboardAnalytics() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const res = await getDashboardAnalytics()
            if (res) setData(res)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )

    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Top Produit</p>
                            <h3 className="text-lg font-bold truncate max-w-[150px]">
                                {data.topProducts[0]?.name || 'N/A'}
                            </h3>
                            {data.topProducts[0] && (
                                <p className="text-[11px] font-black text-blue-600">
                                    {data.topProducts[0].revenue.toLocaleString('fr-FR')} MAD
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Alertes Stock</p>
                            <h3 className="text-xl font-bold">{data.lowStockBooks.length} livres</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Export Ventes</p>
                            <h3 className="text-lg font-bold truncate">Excel Complet</h3>
                        </div>
                    </div>
                    <ExportButton
                        action={exportSalesReport}
                        filename="rapport_ventes"
                        label="Générer Excel"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique Chiffre d'Affaires Mensuel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Chiffre d'affaires mensuel
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`${value} MAD`, 'Total']}
                                />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graphique Répartition par Catégorie */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Package size={20} className="text-secondary" />
                        Ventes par Catégorie
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryRevenue}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.categoryRevenue.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`${value} MAD`, 'Revenu']}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertes de Stock */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-600">
                        <AlertTriangle size={20} />
                        Stocks Faibles
                    </h3>
                    <div className="space-y-4">
                        {data.lowStockBooks.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Tous les stocks sont suffisants.</p>
                        ) : (
                            data.lowStockBooks.map((book: any) => (
                                <div key={book.id} className="flex items-center justify-between p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded overflow-hidden">
                                            <Image src={book.image} alt={book.title} fill className="object-cover" />
                                        </div>
                                        <span className="font-medium text-sm text-gray-800 line-clamp-1">{book.title}</span>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                        Stock: {book.stock}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Produits les plus vendus */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-600">
                        <Star size={20} />
                        Meilleures Ventes
                    </h3>
                    <div className="space-y-4">
                        {data.topProducts.map((product: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    {product.image ? (
                                        <div className="relative w-10 h-10 rounded overflow-hidden border border-gray-100">
                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-white border rounded flex items-center justify-center text-xs font-bold text-gray-400">
                                            #{idx + 1}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-gray-800 line-clamp-1">{product.name}</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{product.type}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{product.sales} ventes</p>
                                    <p className="text-[11px] font-bold text-blue-600">{product.revenue.toLocaleString('fr-FR')} MAD</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
