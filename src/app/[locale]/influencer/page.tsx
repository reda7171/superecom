import { getInfluencerDashboardData } from '@/lib/actions/affiliates'
import { redirect } from 'next/navigation'
import { Users, TrendingUp, ShoppingBag, Banknote, Share2 } from 'lucide-react'

export default async function InfluencerDashboard() {
    const data = await getInfluencerDashboardData()

    if (!data) {
        redirect('/admin/login')
    }

    const { user, stats, orders } = data
    
    const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)
    const totalCommission = stats.reduce((sum, s) => sum + s.commission, 0)
    const totalOrders = stats.reduce((sum, s) => sum + s.ordersCount, 0)
    const totalItems = stats.reduce((sum, s) => sum + s.itemsCount, 0)

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 leading-tight">
                            Bonjour, <span className="text-indigo-600">{user.fullName}</span> 👋
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 italic">
                            Voici vos performances d'affiliation actuelles sur Riwaya.
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Commandes</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{totalOrders}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Livres Vendus</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{totalItems}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                            <Share2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Revenus Générés</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{totalRevenue.toFixed(2)} <span className="text-lg">MAD</span></h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-lg shadow-amber-100 ring-2 ring-amber-500 ring-offset-4 ring-offset-white">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                            <Banknote className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className="text-sm font-black text-indigo-600 uppercase tracking-wider">Ma Commission</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{totalCommission.toFixed(2)} <span className="text-lg">MAD</span></h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Details Table */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Détails par Coupon</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-100 bg-white">
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Code</th>
                                        <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Cmds</th>
                                        <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Comm.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 italic font-medium">
                                    {stats.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-black text-sm uppercase shadow-sm">
                                                    {s.code}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-gray-900">
                                                {s.ordersCount}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg">
                                                {s.commission.toFixed(2)} MAD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div id="orders" className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" /> Dernières Commandes
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-100 bg-white">
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Client / Ville</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Livres</th>
                                        <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="text-xs text-gray-400 font-bold mb-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div className="text-gray-900 font-black">{order.fullName}</div>
                                                <div className="text-[10px] text-indigo-600 font-bold uppercase">{order.city}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="text-xs text-gray-800 flex items-center gap-2">
                                                            <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center font-black text-[10px] shrink-0">{item.quantity}</span>
                                                            <span className="font-bold truncate max-w-[150px]">
                                                                {item.book?.title || item.pack?.name || item.gift?.name || 'Article'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900">
                                                {order.total.toFixed(2)} MAD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
