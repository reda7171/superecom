import { redirect } from 'next/navigation'
import { getAdminStats } from '@/lib/actions/admin-community'
import { Users, BookOpen, Repeat, Star, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCommunityDashboard() {
    const stats = await getAdminStats()

    if (!stats) {
        redirect('/admin')
    }

    const statCards = [
        { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', link: '/admin/community/users' },
        { label: 'Livres', value: stats.totalBooks, icon: BookOpen, color: 'bg-green-500', link: '/admin/community/books' },
        { label: 'Échanges', value: stats.totalExchanges, icon: Repeat, color: 'bg-purple-500', link: '/admin/community/exchanges' },
        { label: 'Évaluations', value: stats.totalRatings, icon: Star, color: 'bg-yellow-500', link: '#' },
        { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'bg-pink-500', link: '#' },
    ]

    const exchangeStats = [
        { label: 'En attente', value: stats.pendingExchanges, icon: Clock, color: 'text-yellow-600' },
        { label: 'Acceptés', value: stats.acceptedExchanges, icon: CheckCircle, color: 'text-green-600' },
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

            {/* Exchange Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-black mb-6">Statut des échanges</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Link href="/admin/community/exchanges" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentExchanges.map((exchange) => (
                            <div key={exchange.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex-grow">
                                    <p className="font-bold text-sm text-black mb-1">{exchange.bookRequested.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {exchange.requester.fullName} → {exchange.responder.fullName}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-black ${exchange.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        exchange.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {exchange.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Books */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-black">Livres récents</h2>
                        <Link href="/admin/community/books" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats.recentBooks.map((book) => (
                            <div key={book.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                {book.image && (
                                    <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-sm text-black truncate">{book.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                                    <p className="text-xs text-gray-400 mt-1">Par {book.owner.fullName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
