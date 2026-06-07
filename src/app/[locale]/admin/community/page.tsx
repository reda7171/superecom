import { redirect } from 'next/navigation'
import { getAdminStats } from '@/lib/actions/admin-community'
import { Users, BookOpen, Repeat, Star, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import StatsChart from '@/components/admin/StatsChart'

export default async function AdminCommunityDashboard() {
    const stats = await getAdminStats()

    if (!stats) {
        redirect('/admin')
    }

    const statCards = [
        { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', link: '/admin/community/users' },
        { label: 'Livres', value: stats.totalBooks, icon: BookOpen, color: 'bg-green-500', link: '/admin/community/products' },
        { label: 'Échanges', value: stats.totalExchanges, icon: Repeat, color: 'bg-purple-500', link: '/admin/exchanges' },
        { label: 'Évaluations', value: stats.totalRatings, icon: Star, color: 'bg-yellow-500', link: '#' },
        { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'bg-pink-500', link: '#' },
    ]

    const exchangeStats = [
        { label: 'En attente', value: stats.pendingExchanges, icon: Clock, color: 'text-yellow-600' },
        { label: 'Acceptés', value: stats.acceptedExchanges, icon: CheckCircle, color: 'text-green-600' },
        { label: 'Réussis', value: stats.completedExchanges, icon: Star, color: 'text-blue-600' },
        { label: 'Refusés', value: stats.rejectedExchanges, icon: XCircle, color: 'text-red-600' },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-black mb-2">Community Dashboard</h1>
                <p className="text-gray-500 font-bold">Gestion de la plateforme d'échange de livres</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Link
                            key={stat.label}
                            href={stat.link}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-black mb-1">{stat.value}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </Link>
                    )
                })}
            </div>

            {/* Tendance des échanges */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-black">Tendance des échanges</h2>
                        <p className="text-sm text-gray-400 font-bold">Activité sur les 7 derniers jours</p>
                    </div>
                </div>
                <StatsChart data={stats.exchangeChartData} />
            </div>

            {/* Exchange Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-black mb-6">Statut des échanges</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {exchangeStats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div key={stat.label} className="flex items-center gap-4">
                                <Icon className={`w-8 h-8 ${stat.color}`} />
                                <div>
                                    <p className="text-2xl font-black text-black">{stat.value}</p>
                                    <p className="text-sm font-bold text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Exchanges */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-black">Échanges récents</h2>
                        <Link href="/admin/exchanges" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentExchanges.map((exchange: any) => (
                            <div key={exchange.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4 flex-grow min-w-0">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                        {exchange.requester.image ? <img src={exchange.requester.image} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-gray-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-black mb-0.5 truncate">{exchange.productRequested.title}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                                            {exchange.requester.fullName} → {exchange.responder.fullName}
                                        </p>
                                    </div>
                                </div>
                                <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exchange.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    exchange.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                        exchange.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {exchange.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-black">Top Performeurs</h2>
                        <Link href="/admin/community/users" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.topRatedUsers.map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black text-xs overflow-hidden">
                                        {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : user.fullName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-black">{user.fullName}</p>
                                        <p className="text-xs text-gray-400 font-bold">{user.city}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">
                                    <Star className="w-3 h-3 fill-yellow-600" />
                                    <span className="text-xs font-black">{user.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-black">Livres récents</h2>
                        <Link href="/admin/community/products" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.recentBooks.map((product: any) => (
                            <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                {product.image && (
                                    <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-sm text-black truncate">{product.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{product.author}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">Par {product.owner.fullName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
