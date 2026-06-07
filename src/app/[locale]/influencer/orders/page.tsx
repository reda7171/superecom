import { getInfluencerDashboardData } from '@/lib/actions/affiliates'
import { redirect } from 'next/navigation'
import { ShoppingBag, Calendar, User, MapPin, Package } from 'lucide-react'

export default async function InfluencerOrdersPage() {
    const data = await getInfluencerDashboardData()

    if (!data) {
        redirect('/admin/login')
    }

    const { user, orders, stats } = data

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
            <div className="max-w-[1700px] mx-auto space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 leading-tight">
                            Mes <span className="text-indigo-600 border-b-8 border-indigo-100 pb-2">Commandes</span> 📦
                        </h1>
                        <p className="text-xl text-gray-500 font-medium mt-4 italic">
                            Historique complet des ventes générées grâce à votre influence.
                        </p>
                    </div>
                </div>

                {/* Orders table */}
                <div className="bg-white rounded-[40px] border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 overflow-hidden transition-all">
                    <div className="px-12 py-10 border-b-2 border-indigo-50 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4 italic">
                            <ShoppingBag className="w-10 h-10 text-indigo-600 p-2 bg-indigo-50 rounded-2xl" /> 
                            Historique des Ventes
                        </h2>
                    </div>
                    <div className="overflow-x-auto overflow-hidden rounded-b-[40px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left border-b border-gray-100 bg-white">
                                    <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Date & Réf</th>
                                    <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Client</th>
                                    <th className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Articles</th>
                                    <th className="px-10 py-6 text-center text-sm font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-10 py-6 text-right text-sm font-black text-gray-400 uppercase tracking-widest">Montant</th>
                                    <th className="px-10 py-6 text-right text-sm font-black text-indigo-600 uppercase tracking-widest">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium italic text-base">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-20 text-center text-gray-400 font-bold text-xl">
                                            Aucune commande générée pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => {
                                        const coupon = stats.find(s => s.code === order.couponCode)
                                        let orderCommission = 0
                                        if (coupon) {
                                            // @ts-ignore
                                            const rate = (coupon as any).commission || 0
                                            if (coupon.type === 'PERCENTAGE') {
                                                orderCommission = (order.total * rate) / 100
                                            } else {
                                                const itemsCount = order.items.reduce((s: number, i: any) => s + i.quantity, 0)
                                                orderCommission = itemsCount * rate
                                            }
                                        }

                                        const isDelivered = ['LIVRÉ', 'DELIVERED', 'REF_LIVRE'].includes(order.status.toUpperCase())

                                        return (
                                            <tr key={order.id} className="hover:bg-indigo-50/20 transition-all duration-300">
                                                <td className="px-10 py-8">
                                                    <div className="text-indigo-600 font-black text-lg mb-1">{order.id.slice(0, 8).toUpperCase()}</div>
                                                    <div className="text-xs text-gray-400 font-bold">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="text-gray-900 font-black text-lg">{order.fullName}</div>
                                                    <div className="text-xs text-indigo-500 font-black uppercase tracking-tighter">{order.city}</div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="space-y-2">
                                                        {order.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-3 text-sm">
                                                                <span className="bg-indigo-600 text-white min-w-[24px] h-6 px-1.5 rounded-lg flex items-center justify-center font-black text-xs">
                                                                    {item.quantity}
                                                                </span>
                                                                <span className="text-gray-800 font-black truncate max-w-[300px]">
                                                                    {item.product?.title || item.pack?.name || item.gift?.name || 'Article'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase shadow-sm ${
                                                        isDelivered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="text-2xl font-black text-gray-900">{order.total.toFixed(2)} <span className="text-sm">MAD</span></div>
                                                    <div className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Coupon: {order.couponCode}</div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="text-3xl font-black text-indigo-600">+{orderCommission.toFixed(2)} <span className="text-lg">MAD</span></div>
                                                    {isDelivered ? (
                                                        <div className="text-sm text-green-500 font-black mt-1 flex items-center justify-end gap-1">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Validé
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-amber-500 font-black mt-1 italic flex items-center justify-end gap-1">
                                                            <Package className="w-4 h-4" /> En attente
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
