import { getSellerDashboardData } from '@/lib/actions/seller/dashboard'
import { BookOpen, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getCommunityUser } from '@/lib/actions/community-auth'

export default async function SellerDashboardPage() {
    const [user, data] = await Promise.all([
        getCommunityUser(),
        getSellerDashboardData()
    ])

    const stats = [
        { label: 'Mes Livres', value: data.booksCount, icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
        { label: 'Commandes', value: data.ordersCount, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
        { label: 'CA Total', value: `${data.totalRevenue.toFixed(2)} MAD`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    ]

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tighter capitalize">Salut, {user?.fullName}! 👋</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Votre boutique SuperEcom Marketplace</p>
                </div>
                <Link 
                    href="/seller/products/new" 
                    className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                >
                    Nouveau Livre
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col gap-6">
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-black tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Recent Orders */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-black uppercase tracking-tight">Dernières commandes</h2>
                        <Link href="/seller/orders" className="text-xs font-black text-gray-400 hover:text-black transition-colors underline underline-offset-4 decoration-2">Tout voir</Link>
                    </div>
                    {data.recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <ShoppingBag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold text-sm">Aucune commande pour le moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {data.recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-xs text-black shadow-sm">
                                            #{order.id.slice(-4).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-black truncate max-w-[150px]">{order.fullName}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-black">{order.total.toFixed(2)} MAD</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Tips or Info */}
                <div className="bg-pixio-cream rounded-[2.5rem] p-10 relative overflow-hidden group">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-pixio-yellow/20 rounded-full blur-3xl transition-all group-hover:scale-125" />
                    <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4 relative z-10">Conseil de vente</h2>
                    <p className="text-gray-600 font-bold text-sm leading-relaxed mb-8 relative z-10">
                        Améliorez vos chances de vendre en ajoutant des photos réelles de vos livres et des descriptions détaillées. 
                        N'oubliez pas d'indiquer l'état exact (Comme neuf, Bon état, Occasion).
                    </p>
                    <button className="bg-black text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest relative z-10 group-hover:translate-x-2 transition-transform shadow-xl">
                        En savoir plus
                    </button>
                    <TrendingUp className="absolute right-10 top-10 w-24 h-24 text-black/5 -rotate-12 group-hover:rotate-0 transition-all duration-500" />
                </div>
            </div>
        </div>
    )
}
