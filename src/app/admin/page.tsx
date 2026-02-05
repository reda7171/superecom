import { prisma } from '@/lib/prisma'
import { BookOpen, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getBadgeStats } from '@/lib/actions/analytics'

async function getStats() {
    const [booksCount, packsCount, ordersCount, totalRevenue] = await Promise.all([
        prisma.book.count({ where: { active: true } }),
        prisma.pack.count({ where: { active: true } }),
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: { total: true },
        }),
    ])

    return {
        booksCount,
        packsCount,
        ordersCount,
        totalRevenue: totalRevenue._sum.total || 0,
    }
}

async function getRecentOrders() {
    return prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            items: true,
        },
    })
}

async function getLowStockBooks() {
    return prisma.book.findMany({
        where: {
            stock: { lte: 5 },
            active: true
        },
        orderBy: { stock: 'asc' },
        take: 5
    })
}

export default async function AdminDashboard() {
    const stats = await getStats()
    const recentOrders = await getRecentOrders()
    const lowStockBooks = await getLowStockBooks()
    const badgeStats = await getBadgeStats()

    const statCards = [
        {
            name: 'Livres Actifs',
            value: stats.booksCount,
            icon: BookOpen,
            color: 'blue',
        },
        {
            name: 'Packs Actifs',
            value: stats.packsCount,
            icon: Package,
            color: 'purple',
        },
        {
            name: 'Commandes',
            value: stats.ordersCount,
            icon: ShoppingCart,
            color: 'green',
        },
        {
            name: 'Chiffre d\'affaires',
            value: `${stats.totalRevenue.toFixed(0)} MAD`,
            icon: TrendingUp,
            color: 'orange',
        },
    ]

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
    }

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const statusLabels = {
        PENDING: 'En attente',
        CONFIRMED: 'Confirmée',
        SHIPPED: 'En livraison',
        DELIVERED: 'Livrée',
        CANCELLED: 'Annulée',
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                    Vue d'ensemble de votre plateforme Riwaya
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.name} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.name}</p>
                                    <p className="mt-2 text-3xl font-black text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-xl shadow-inner ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Marketing Analytics (New Widget) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
                            <h2 className="text-lg font-black text-purple-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Performance Marketing
                            </h2>
                        </div>
                        <div className="p-6">
                            {badgeStats.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm italic">Aucune donnée de clic pour le moment.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {badgeStats.map((stat: any) => (
                                        <div key={stat.name} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors border border-gray-100">
                                            <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{stat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-black text-gray-900">Commandes Récentes</h2>
                            <Link href="/admin/orders" className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg">Tout voir</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{order.fullName}</div>
                                                <div className="text-xs text-gray-500 font-medium">{order.city}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600">
                                                {order.total} MAD
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${statusColors[order.status as keyof typeof statusColors]}`}>
                                                    {statusLabels[order.status as keyof typeof statusLabels]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-red-50/50">
                            <h2 className="text-lg font-black text-red-900 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Alertes Stock
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {lowStockBooks.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 text-sm font-medium italic">
                                    Tous les stocks sont au vert ! ✨
                                </div>
                            ) : (
                                lowStockBooks.map((book) => (
                                    <div key={book.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-bold text-gray-900 truncate">{book.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{book.author}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${book.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {book.stock} restants
                                            </span>
                                            <Link
                                                href={`/admin/books/${book.id}/edit`}
                                                className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                            <Link href="/admin/books" className="text-sm font-black text-gray-500 hover:text-gray-900 transition-colors">
                                Gérer tout l'inventaire
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
