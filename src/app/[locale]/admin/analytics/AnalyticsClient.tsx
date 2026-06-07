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
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2">
                        Analytics<span className="text-gray-200">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Performances & Croissance de la boutique
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span>Données en temps réel</span>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Chiffre d'Affaires", value: `${stats?.totalRevenue.toFixed(0)} MAD`, icon: DollarSign, color: "bg-black", iconColor: "text-white" },
                    { label: "Total Commandes", value: stats?.totalOrders, icon: ShoppingCart, color: "bg-yellow-400", iconColor: "text-black" },
                    { label: "Taux de Conversion", value: `${conversion?.rate}%`, icon: Target, color: "bg-pink-500", iconColor: "text-white" },
                    { label: "Produits Actifs", value: stats?.totalBooks + stats?.totalPacks, icon: Package, color: "bg-blue-600", iconColor: "text-white" }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-12 h-12 ${kpi.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{kpi.label}</p>
                        <p className="text-3xl font-black text-black tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Évolution du CA */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-black tracking-tighter">Évolution du CA</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Revenus générés sur la période</p>
                    </div>
                    <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                        {[
                            { id: 'day', label: '7J' },
                            { id: 'week', label: '4S' },
                            { id: 'month', label: '12M' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setPeriod(btn.id as any)}
                                className={`px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${period === btn.id
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" stroke="#999" style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                            <YAxis stroke="#999" style={{ fontSize: '10px', fontWeight: '900' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000',
                                    border: 'none',
                                    borderRadius: '1.5rem',
                                    color: '#fff',
                                    padding: '1rem',
                                    fontWeight: '900',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#000"
                                strokeWidth={4}
                                dot={{ fill: '#000', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Top Produits */}
                <div className="lg:col-span-7 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-black tracking-tighter">Best-Sellers</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Les 5 produits les plus performants</p>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] hover:bg-gray-100/50 transition-colors">
                                <div className="relative w-16 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <Package className="w-6 h-6 text-gray-200" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-sm text-black mb-1 truncate uppercase tracking-tight">{product.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] bg-white px-3 py-1 rounded-full font-black text-gray-400 uppercase border border-gray-100">
                                            {product.quantity} ventes
                                        </span>
                                        <p className="text-xs text-black font-black">
                                            {product.revenue.toFixed(0)} MAD
                                        </p>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-gray-200">0{index + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Distribution des Statuts */}
                <div className="lg:col-span-5 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-black tracking-tighter">Flux Commandes</h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Répartition par statut logistique</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusDist}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    cornerRadius={8}
                                >
                                    {statusDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Badges Cliqués */}
            {badgeStats.length > 0 && (
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <MousePointerClick className="w-6 h-6 text-black" />
                                <h2 className="text-2xl font-black text-black tracking-tighter">Impact Marketing</h2>
                            </div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Performance des badges produits</p>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={badgeStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#999" style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                                <YAxis stroke="#999" style={{ fontSize: '10px', fontWeight: '900' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: 'none',
                                        borderRadius: '1.5rem',
                                        color: '#fff',
                                        padding: '1rem',
                                        fontWeight: '900',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#000" radius={[12, 12, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
