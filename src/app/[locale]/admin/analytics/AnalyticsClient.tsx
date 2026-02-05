'use client'

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Package, DollarSign, ShoppingCart, Target, MousePointerClick } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
    getDashboardStats,
    getRevenueByPeriod,
    getTopProducts,
    getConversionRate,
    getOrderStatusDistribution,
    getBadgeStats,
} from '@/lib/actions/analytics'
import Image from 'next/image'

const COLORS = ['#000000', '#FFD700', '#FF69B4', '#10B981', '#3B82F6', '#F59E0B']

export default function AnalyticsClient() {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
    const [stats, setStats] = useState<any>(null)
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [conversion, setConversion] = useState<any>(null)
    const [statusDist, setStatusDist] = useState<any[]>([])
    const [badgeStats, setBadgeStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [period])

    async function loadData() {
        setLoading(true)
        try {
            const [statsData, revenue, products, conv, status, badges] = await Promise.all([
                getDashboardStats(),
                getRevenueByPeriod(period),
                getTopProducts(5),
                getConversionRate(),
                getOrderStatusDistribution(),
                getBadgeStats(),
            ])

            setStats(statsData)
            setRevenueData(revenue)
            setTopProducts(products)
            setConversion(conv)
            setStatusDist(status)
            setBadgeStats(badges)
        } catch (error) {
            console.error('Erreur chargement analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Chargement des analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-black mb-2">Analytics & Statistiques</h1>
                <p className="text-gray-500 font-bold">Vue d'ensemble des performances de votre boutique</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Chiffre d'Affaires
                    </p>
                    <p className="text-3xl font-black text-black">{stats?.totalRevenue.toFixed(2)} MAD</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-pixio-yellow rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-black" />
                        </div>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Total Commandes
                    </p>
                    <p className="text-3xl font-black text-black">{stats?.totalOrders}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-pixio-pink rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-black" />
                        </div>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Taux de Conversion
                    </p>
                    <p className="text-3xl font-black text-black">{conversion?.rate}%</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Produits Actifs
                    </p>
                    <p className="text-3xl font-black text-black">{stats?.totalBooks + stats?.totalPacks}</p>
                </div>
            </div>

            {/* Évolution du CA */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-black">Évolution du Chiffre d'Affaires</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPeriod('day')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${period === 'day'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            7 Jours
                        </button>
                        <button
                            onClick={() => setPeriod('week')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${period === 'week'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            4 Semaines
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${period === 'month'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            12 Mois
                        </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                        <YAxis stroke="#999" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e5e5',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#000"
                            strokeWidth={3}
                            dot={{ fill: '#000', r: 5 }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Produits */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-black mb-6">Top 5 Produits Vendus</h2>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="relative w-16 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-sm text-black mb-1">{product.name}</h3>
                                    <p className="text-xs text-gray-500 font-bold">
                                        {product.quantity} vendus • {product.revenue.toFixed(2)} MAD
                                    </p>
                                </div>
                                <div className="text-2xl font-black text-black">#{index + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Distribution des Statuts */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-black mb-6">Distribution des Commandes</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDist}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ status, count }: any) => `${status}: ${count}`}
                            >
                                {statusDist.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Badges Cliqués */}
            {badgeStats.length > 0 && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <MousePointerClick className="w-6 h-6 text-black" />
                        <h2 className="text-xl font-black text-black">Badges les Plus Cliqués</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={badgeStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#999" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                            <YAxis stroke="#999" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                }}
                            />
                            <Bar dataKey="value" fill="#000" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
