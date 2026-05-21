import { prisma } from '@/lib/prisma'
import { BookOpen, Package, ShoppingCart, TrendingUp, BarChart2, ShoppingBag, Cpu, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getBadgeStats } from '@/lib/actions/analytics'
import DashboardAnalytics from '@/components/admin/DashboardAnalytics'
import { isAuthenticated } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { getSetting } from '@/lib/actions/site-settings'

async function getStats() {
    const [booksCount, packsCount, ordersCount, totalRevenue, deliveredCount] = await Promise.all([
        prisma.book.count({ where: { active: true } }),
        prisma.pack.count({ where: { active: true } }),
        prisma.order.count({ where: { status: { notIn: ['CANCELLED', 'RETURNED'] } } }), // Commandes valides
        prisma.order.aggregate({ 
            where: { status: 'DELIVERED' }, 
            _sum: { total: true } 
        }),
        // Commandes livrées pour le taux de conversion
        prisma.order.count({ where: { status: 'DELIVERED' } }),
    ])

    const totalRev = totalRevenue._sum.total || 0
    // Panier moyen = CA / nombre de commandes livrées
    const panierMoyen = deliveredCount > 0 ? totalRev / deliveredCount : 0
    // Taux conversion = livrées / total des commandes valides (hors annulées/retournées)
    const tauxConversion = ordersCount > 0 ? (deliveredCount / ordersCount) * 100 : 0


    return {
        booksCount,
        packsCount,
        ordersCount,
        totalRevenue: totalRev,
        panierMoyen,
        tauxConversion,
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

async function getTopPerformers() {
    // Récupérer les livres les plus vendus
    const topBooks = await prisma.orderItem.groupBy({
        by: ['bookId'],
        where: {
            type: 'BOOK',
            bookId: { not: null },
            order: {
                status: {
                    notIn: ['CANCELLED', 'RETURNED']
                }
            }
        },
        _sum: {
            quantity: true,
            price: true
        },
        _count: {
            id: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    })

    // Récupérer les détails des livres
    const booksWithDetails = await Promise.all(
        topBooks.map(async (item) => {
            const book = await prisma.book.findUnique({
                where: { id: item.bookId! },
                select: { id: true, title: true, author: true, image: true, price: true }
            })
            return {
                ...book,
                totalOrders: item._count.id,
                totalQuantity: item._sum.quantity || 0,
                totalRevenue: item._sum.price || 0
            }
        })
    )

    // Récupérer les packs les plus vendus
    const topPacks = await prisma.orderItem.groupBy({
        by: ['packId'],
        where: {
            type: 'PACK',
            packId: { not: null },
            order: {
                status: {
                    notIn: ['CANCELLED', 'RETURNED']
                }
            }
        },
        _sum: {
            quantity: true,
            price: true
        },
        _count: {
            id: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    })

    // Récupérer les détails des packs
    const packsWithDetails = await Promise.all(
        topPacks.map(async (item) => {
            const pack = await prisma.pack.findUnique({
                where: { id: item.packId! },
                select: { id: true, name: true, image: true, price: true }
            })
            return {
                ...pack,
                totalOrders: item._count.id,
                totalQuantity: item._sum.quantity || 0,
                totalRevenue: item._sum.price || 0
            }
        })
    )

    return {
        books: booksWithDetails.filter(b => b.id !== null),
        packs: packsWithDetails.filter(p => p.id !== null)
    }
}



export default async function AdminDashboard(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params
    const { locale } = params

    const isAuth = await isAuthenticated()
    if (!isAuth) {
        redirect(`/${locale}/admin/login`)
    }

    const stats = await getStats()
    const recentOrders = await getRecentOrders()
    const lowStockBooks = await getLowStockBooks()
    const badgeStats = await getBadgeStats()
    const topPerformers = await getTopPerformers()
    const n8nBaseUrl = await getSetting('n8n_base_url') || 'http://167.86.108.246:5678/'

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
        {
            name: 'Taux Conversion',
            value: `${stats.tauxConversion.toFixed(1)}%`,
            icon: BarChart2,
            color: 'teal',
        },
        {
            name: 'Panier Moyen',
            value: `${stats.panierMoyen.toFixed(0)} MAD`,
            icon: ShoppingBag,
            color: 'rose',
        },
    ]

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        teal: 'bg-teal-100 text-teal-600',
        rose: 'bg-rose-100 text-rose-600',
    }

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        RETURNED: 'bg-orange-100 text-orange-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const statusLabels = {
        PENDING: 'En attente',
        CONFIRMED: 'Confirmée',
        SHIPPED: 'En livraison',
        DELIVERED: 'Livrée',
        RETURNED: 'Retournée',
        CANCELLED: 'Annulée',
    }

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Tableau<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Centre de commande global Riwaya
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <a
                        href="https://web.whatsapp.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3 bg-white border border-[#25D366] text-[#25D366] rounded-2xl hover:bg-[#25D366] hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.195 1.6 6.004L.014 24l6.108-1.597A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm-1.042 17.653c-1.802 0-3.565-.483-5.116-1.404l-.367-.218-3.805.996.996-3.805-.218-.367c-.921-1.551-1.404-3.314-1.404-5.116 0-5.617 4.568-10.185 10.185-10.185 5.617 0 10.185 4.568 10.185 10.185 0 5.617-4.568 10.185-10.185 10.185zm5.59-7.618c-.307-.154-1.815-.895-2.097-.996-.281-.102-.486-.154-.69.154-.205.307-.793.996-.972 1.201-.18.205-.358.23-.665.077-1.464-.73-2.673-1.637-3.72-3.136-.205-.282.205-.268.808-1.482.102-.205.051-.383-.026-.537-.077-.154-.69-1.662-.946-2.276-.256-.614-.512-.512-.69-.512-.18 0-.383 0-.588 0-.205 0-.537.077-.819.384-.281.307-1.074 1.048-1.074 2.556 0 1.509 1.1 2.967 1.253 3.171.154.205 2.148 3.395 5.253 4.673 2.063.851 2.766.921 3.279.768.512-.154 1.815-.742 2.071-1.458.256-.716.256-1.329.18-1.458-.077-.128-.281-.205-.588-.358z" /></svg>
                        WhatsApp
                    </a>
                    <a
                        href={n8nBaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-900 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                    >
                        <Cpu className="w-4 h-4 text-orange-500" />
                        n8n Server
                    </a>
                </div>
            </div>

            {/* Stats Grid Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.name} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-black/5 hover:-translate-y-1 transition-all relative overflow-hidden">
                            <div className="flex flex-col relative z-10">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{stat.name}</p>
                                <p className="text-3xl font-black text-black tracking-tighter mb-4">{stat.value}</p>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${colorClasses[stat.color as keyof typeof colorClasses]} shadow-current/10`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2">
                                <span className="text-[10px] font-black text-emerald-500 italic">+12%</span>
                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">vs mois dernier</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 p-10">
                <DashboardAnalytics />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Marketing Widget Premium */}
                <div className="lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Performance Marketing
                        </h2>
                    </div>
                    <div className="p-10">
                        {badgeStats.length === 0 ? (
                            <div className="text-center text-gray-300 py-6 italic font-bold uppercase text-[10px]">Aucune donnée</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {badgeStats.map((stat: any) => (
                                    <div key={stat.name} className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100 group">
                                        <span className="text-3xl font-black text-black tracking-tighter group-hover:scale-110 transition-transform">{stat.value}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2">{stat.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Performers Premium */}
                <div className="lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            Classement des ventes
                        </h2>
                    </div>
                    <div className="p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Top Books */}
                            <div>
                                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 italic">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    Livres Vedettes
                                </h3>
                                <div className="space-y-4">
                                    {topPerformers.books.map((book: any, index: number) => (
                                        <div key={book.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-black italic shadow-lg">0{index + 1}</span>
                                            {book.image && (
                                                <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                                    <img src={book.image} alt={book.title} className="w-full h-full object-cover unoptimized" />
                                                </div>
                                            )}
                                            <div className="flex-grow min-w-0">
                                                <p className="font-black text-[10px] text-black uppercase truncate italic">{book.title}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-blue-600">{book.totalQuantity} VENTES</span>
                                                    <span className="text-[10px] font-black text-emerald-500">{book.totalRevenue.toFixed(0)} MAD</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Packs */}
                            <div>
                                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 italic">
                                    <Package className="w-4 h-4 text-purple-600" />
                                    Packs les plus rentables
                                </h3>
                                <div className="space-y-4">
                                    {topPerformers.packs.map((pack: any, index: number) => (
                                        <div key={pack.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-black italic shadow-lg">0{index + 1}</span>
                                            {pack.image && (
                                                <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                                    <img src={pack.image} alt={pack.name} className="w-full h-full object-cover unoptimized" />
                                                </div>
                                            )}
                                            <div className="flex-grow min-w-0">
                                                <p className="font-black text-[10px] text-black uppercase truncate italic">{pack.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-purple-600">{pack.totalQuantity} VENTES</span>
                                                    <span className="text-[10px] font-black text-emerald-500">{pack.totalRevenue.toFixed(0)} MAD</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Premium */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dernières Transactions</h2>
                        <Link href="/admin/orders" className="text-[9px] font-black text-white bg-black px-4 py-2 rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest">Voir tout</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <div className="text-xs font-black text-black uppercase tracking-tight italic">{order.fullName}</div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{order.city}</div>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-blue-600 tracking-tighter">
                                            {order.total.toLocaleString()} MAD
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-right">
                                            <span className={`px-4 py-1 inline-flex text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm ${statusColors[order.status as keyof typeof statusColors]}`}>
                                                {statusLabels[order.status as keyof typeof statusLabels]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts Premium */}
                <div className="lg:col-span-1 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
                        <h2 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Alerte Rupture
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {lowStockBooks.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="font-black uppercase tracking-widest text-[9px] text-gray-400">Stock optimal</p>
                            </div>
                        ) : (
                            lowStockBooks.map((book) => (
                                <div key={book.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-[10px] font-black text-black uppercase truncate italic">{book.title}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{book.author}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${book.stock === 0 ? 'bg-black text-red-500 shadow-lg shadow-red-500/10' : 'bg-red-50 text-red-600'}`}>
                                            {book.stock} RESTANTS
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-8 bg-gray-50/50 border-t border-gray-50">
                        <Link href="/admin/books" className="block w-full text-center py-4 bg-white border border-gray-100 rounded-2xl text-[9px] font-black text-gray-400 hover:text-black hover:border-black transition-all uppercase tracking-[0.2em]">Rapprovisionner</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
